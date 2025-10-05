import { defineConfig } from 'vite';
import path from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'fs';

export default defineConfig({
  plugins: [
    viteSingleFile({
      removeViteModuleLoader: true,
      useRecommendedBuildConfig: true,
    }),
    // Post-process для Bigo Ads
    {
      name: 'bigo-post-process',
      closeBundle() {
        const distPath = path.resolve(__dirname, 'dist');
        const bigoPath = path.join(distPath, 'bigo');
        
        // Создаем папку bigo если ее нет
        if (!fs.existsSync(bigoPath)) {
          fs.mkdirSync(bigoPath, { recursive: true });
        }
        
        const indexPath = path.join(distPath, 'index.html');
        const bigoIndexPath = path.join(bigoPath, 'index.html');
        
        if (fs.existsSync(indexPath)) {
          // Читаем HTML
          let html = fs.readFileSync(indexPath, 'utf-8');
          
          // Удаляем запрещенные атрибуты (как для Mintegral)
          html = html.replace(/\s+type="module"/g, '');
          html = html.replace(/\s+crossorigin/g, '');
          html = html.replace(/rel="stylesheet"\s+crossorigin/g, 'rel="stylesheet"');
          
          console.log('✅ Removed forbidden attributes for Bigo');
          
          // Записываем index.html в папку bigo
          fs.writeFileSync(bigoIndexPath, html, 'utf-8');
          console.log('✅ Created bigo/index.html');
          
          // Создаем config.json
          const config = {
            orientation: 0  // 0 = horizontal or vertical (оба), 1 = vertical only, 2 = horizontal only
          };
          
          const configPath = path.join(bigoPath, 'config.json');
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
          console.log('✅ Created bigo/config.json (orientation: 0 - adaptive)');
          
          console.log('');
          console.log('📦 Bigo Ads files ready in dist/bigo/');
          console.log('📝 To create ZIP: Compress dist/bigo/ folder (only index.html + config.json)');
          console.log('');
        }
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.obj', '**/*.mtl', '**/*.FBX', '**/*.glb', '**/*.gltf', '**/*.mp3'],
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 100000000, // Все в base64
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
    },
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
  },
});

