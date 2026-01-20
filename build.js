const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const CleanCSS = require('clean-css');
const htmlMinifier = require('html-minifier-terser');

const SRC_DIR = './src';
const DIST_DIR = './dist';

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

    // 11. Copy other assets if they exist
    const assetsDir = path.join(SRC_DIR, 'images');
    if (fs.existsSync(assetsDir)) {
        fs.cpSync(assetsDir, path.join(DIST_DIR, 'images'), { recursive: true });
        console.log('✓ Copied images');
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
    const totalDistSize = distHtmlSize + distCssSize;

    console.log('\n📊 Build Stats:');
    console.log(`   Source HTML: ${(srcSize / 1024).toFixed(1)} KB`);
    console.log(`   Output HTML: ${(distHtmlSize / 1024).toFixed(1)} KB`);
    console.log(`   Output CSS:  ${(distCssSize / 1024).toFixed(1)} KB`);
    console.log(`   Total:       ${(totalDistSize / 1024).toFixed(1)} KB`);
    console.log(`\n✅ Build complete! Output in ./dist/`);
}

build().catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
});
