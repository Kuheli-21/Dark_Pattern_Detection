import esbuild from 'esbuild';
import copyfiles from 'copyfiles';
import fs from 'fs';

async function buildExtension() {
  console.log('📦 Bundling extension background.js and content-script.js...');

  // Ensure dist directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  // Bundle service worker background.js
  await esbuild.build({
    entryPoints: ['src/background.js'],
    bundle: true,
    outfile: 'dist/background.js',
    format: 'esm',
    target: ['chrome100'],
    minify: false,
  });

  // Bundle content-script.js (including React overlay dependencies)
  await esbuild.build({
    entryPoints: ['src/content-script.js'],
    bundle: true,
    outfile: 'dist/content-script.js',
    format: 'iife',
    target: ['chrome100'],
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
    minify: false,
    define: { 'process.env.NODE_ENV': '"production"' },
  });

  // Copy manifest.json to dist
  fs.copyFileSync('manifest.json', 'dist/manifest.json');

  console.log('✅ Extension build complete! Extension dist folder ready.');
}

buildExtension().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
