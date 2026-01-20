const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const CleanCSS = require('clean-css');
const htmlMinifier = require('html-minifier-terser');
const sharp = require('sharp');

const SRC_DIR = './src';
const DIST_DIR = './dist';

// Image optimization settings
const IMAGE_CONFIG = {
    jpeg: { quality: 80, mozjpeg: true },
    webp: { quality: 80 },
    maxWidth: 1920,  // Max width for large images
    thumbWidth: 800  // Width for smaller images
};

async function optimizeImages() {
    const imagesDir = path.join(SRC_DIR, 'images');
    const outputDir = path.join(DIST_DIR, 'images');

    if (!fs.existsSync(imagesDir)) {
        return { original: 0, optimized: 0, saved: 0 };
    }

    fs.mkdirSync(outputDir, { recursive: true });

    const files = fs.readdirSync(imagesDir).filter(f =>
        /\.(jpg|jpeg|png|webp)$/i.test(f)
    );

    let totalOriginal = 0;
    let totalOptimized = 0;

    for (const file of files) {
        const inputPath = path.join(imagesDir, file);
        const outputPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png)$/i, '.jpg'));
        const webpPath = path.join(outputDir, file.replace(/\.(jpg|jpeg|png|webp)$/i, '.webp'));

        const originalSize = fs.statSync(inputPath).size;
        totalOriginal += originalSize;

        try {
            const image = sharp(inputPath);
            const metadata = await image.metadata();

            // Determine max width based on image purpose
            const isLarge = metadata.width > 1200;
            const maxWidth = isLarge ? IMAGE_CONFIG.maxWidth : IMAGE_CONFIG.thumbWidth;

            // Resize if needed and optimize as JPEG
            let pipeline = image.clone();
            if (metadata.width > maxWidth) {
                pipeline = pipeline.resize(maxWidth, null, {
                    withoutEnlargement: true,
                    fit: 'inside'
                });
            }

            // Save optimized JPEG
            await pipeline
                .jpeg(IMAGE_CONFIG.jpeg)
                .toFile(outputPath);

            // Also create WebP version
            pipeline = sharp(inputPath);
            if (metadata.width > maxWidth) {
                pipeline = pipeline.resize(maxWidth, null, {
                    withoutEnlargement: true,
                    fit: 'inside'
                });
            }
            await pipeline
                .webp(IMAGE_CONFIG.webp)
                .toFile(webpPath);

            const optimizedSize = fs.statSync(outputPath).size;
            const webpSize = fs.statSync(webpPath).size;
            totalOptimized += Math.min(optimizedSize, webpSize);

        } catch (err) {
            console.error(`  ⚠ Error processing ${file}:`, err.message);
            // Copy original as fallback
            fs.copyFileSync(inputPath, outputPath);
            totalOptimized += originalSize;
        }
    }

    return {
        original: totalOriginal,
        optimized: totalOptimized,
        saved: totalOriginal - totalOptimized,
        count: files.length
    };
}

async function build() {
    console.log('🔨 Building Casa del Travertino...\n');

    // 1. Clean dist folder
    if (fs.existsSync(DIST_DIR)) {
        fs.rmSync(DIST_DIR, { recursive: true });
    }
    fs.mkdirSync(DIST_DIR);
    console.log('✓ Cleaned dist folder');

    // 2. Read source HTML
    let htmlSource = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf8');
    console.log('✓ Read source HTML');

    // 3. Generate Tailwind CSS (only used classes)
    const cssInput = `
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
    `;

    const result = await postcss([
        tailwindcss('./tailwind.config.js'),
        autoprefixer
    ]).process(cssInput, { from: undefined });

    console.log('✓ Generated Tailwind CSS');

    // 4. Extract custom styles from HTML
    const customStylesMatch = htmlSource.match(/<style>([\s\S]*?)<\/style>/);
    let customStyles = '';
    if (customStylesMatch) {
        customStyles = customStylesMatch[1];
    }

    // 5. Combine and minify CSS
    const combinedCss = result.css + '\n' + customStyles;
    const minifiedCss = new CleanCSS({ level: 2 }).minify(combinedCss);
    console.log(`✓ Minified CSS (${(minifiedCss.styles.length / 1024).toFixed(1)} KB)`);

    // 6. Write CSS file
    fs.writeFileSync(path.join(DIST_DIR, 'styles.css'), minifiedCss.styles);
    console.log('✓ Created styles.css');

    // 7. Prepare HTML
    let optimizedHtml = htmlSource
        // Remove Tailwind CDN script
        .replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/, '')
        // Remove Tailwind config script
        .replace(/<script>\s*tailwind\.config[\s\S]*?<\/script>/, '')
        // Replace style tag with link to CSS file
        .replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="styles.css">');

    // 8. Minify inline JavaScript
    const scriptMatch = optimizedHtml.match(/<script>([\s\S]*?)<\/script>(?=\s*<\/body>)/);
    if (scriptMatch) {
        const minifiedJs = scriptMatch[1]
            .replace(/\/\/.*$/gm, '')
            .replace(/\s+/g, ' ')
            .replace(/\s*([{}();,:])\s*/g, '$1')
            .trim();
        optimizedHtml = optimizedHtml.replace(
            /<script>([\s\S]*?)<\/script>(?=\s*<\/body>)/,
            `<script>${minifiedJs}</script>`
        );
    }
    console.log('✓ Minified JavaScript');

    // 9. Minify HTML
    const finalHtml = await htmlMinifier.minify(optimizedHtml, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
    });
    console.log('✓ Minified HTML');

    // 10. Write output
    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), finalHtml);

    // 11. Optimize images
    console.log('⏳ Optimizing images...');
    const imageStats = await optimizeImages();
    if (imageStats.count > 0) {
        console.log(`✓ Optimized ${imageStats.count} images (saved ${(imageStats.saved / 1024).toFixed(0)} KB)`);
    }

    // 12. Copy CNAME if exists
    if (fs.existsSync('./CNAME')) {
        fs.copyFileSync('./CNAME', path.join(DIST_DIR, 'CNAME'));
        console.log('✓ Copied CNAME');
    }

    // Stats
    const srcSize = Buffer.byteLength(htmlSource, 'utf8');
    const distHtmlSize = Buffer.byteLength(finalHtml, 'utf8');
    const distCssSize = minifiedCss.styles.length;

    console.log('\n📊 Build Stats:');
    console.log(`   HTML:   ${(srcSize / 1024).toFixed(1)} KB → ${(distHtmlSize / 1024).toFixed(1)} KB`);
    console.log(`   CSS:    ${(distCssSize / 1024).toFixed(1)} KB (Tailwind purged)`);
    if (imageStats.count > 0) {
        console.log(`   Images: ${(imageStats.original / 1024).toFixed(0)} KB → ${(imageStats.optimized / 1024).toFixed(0)} KB (-${((imageStats.saved / imageStats.original) * 100).toFixed(0)}%)`);
    }
    console.log(`\n✅ Build complete! Output in ./dist/`);
}

build().catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
});
