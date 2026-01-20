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
    const htmlSource = fs.readFileSync(path.join(SRC_DIR, 'index.html'), 'utf8');
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

    // 4. Minify CSS
    const minifiedCss = new CleanCSS({
        level: 2
    }).minify(result.css);
    console.log(`✓ Minified CSS (${(minifiedCss.styles.length / 1024).toFixed(1)} KB)`);

    // 5. Extract custom styles from HTML
    const customStylesMatch = htmlSource.match(/<style>([\s\S]*?)<\/style>/);
    let customStyles = '';
    if (customStylesMatch) {
        const minifiedCustomCss = new CleanCSS({ level: 2 }).minify(customStylesMatch[1]);
        customStyles = minifiedCustomCss.styles;
    }
    console.log('✓ Extracted and minified custom styles');

    // 6. Extract and minify inline JavaScript
    const scriptMatch = htmlSource.match(/<script>([\s\S]*?)<\/script>(?=\s*<\/body>)/);
    let minifiedJs = '';
    if (scriptMatch) {
        // Simple JS minification (remove comments, extra whitespace)
        minifiedJs = scriptMatch[1]
            .replace(/\/\/.*$/gm, '') // Remove single-line comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/\s*([{}();,:])\s*/g, '$1') // Remove space around punctuation
            .trim();
    }
    console.log('✓ Minified JavaScript');

    // 7. Build optimized HTML
    let optimizedHtml = htmlSource
        // Remove Tailwind CDN script
        .replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/, '')
        // Remove Tailwind config script
        .replace(/<script>\s*tailwind\.config[\s\S]*?<\/script>/, '')
        // Replace style tag with combined minified CSS
        .replace(/<style>[\s\S]*?<\/style>/, `<style>${minifiedCss.styles}${customStyles}</style>`)
        // Replace script with minified version
        .replace(/<script>([\s\S]*?)<\/script>(?=\s*<\/body>)/, `<script>${minifiedJs}</script>`);

    // 8. Minify HTML
    const finalHtml = await htmlMinifier.minify(optimizedHtml, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true
    });
    console.log('✓ Minified HTML');

    // 9. Write output
    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), finalHtml);

    // 10. Copy other assets if they exist
    const assetsDir = path.join(SRC_DIR, 'images');
    if (fs.existsSync(assetsDir)) {
        fs.cpSync(assetsDir, path.join(DIST_DIR, 'images'), { recursive: true });
        console.log('✓ Copied images');
    }

    // 11. Copy CNAME if exists
    if (fs.existsSync('./CNAME')) {
        fs.copyFileSync('./CNAME', path.join(DIST_DIR, 'CNAME'));
        console.log('✓ Copied CNAME');
    }

    // Stats
    const srcSize = Buffer.byteLength(htmlSource, 'utf8');
    const distSize = Buffer.byteLength(finalHtml, 'utf8');
    const savings = ((1 - distSize / srcSize) * 100).toFixed(1);

    console.log('\n📊 Build Stats:');
    console.log(`   Source: ${(srcSize / 1024).toFixed(1)} KB`);
    console.log(`   Output: ${(distSize / 1024).toFixed(1)} KB`);
    console.log(`   Saved:  ${savings}%`);
    console.log(`\n✅ Build complete! Output in ./dist/`);
}

build().catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
});
