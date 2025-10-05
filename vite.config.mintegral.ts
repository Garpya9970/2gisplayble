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
    // Удаляем запрещенные атрибуты и переименовываем
    {
      name: 'mintegral-post-process',
      closeBundle() {
        const distPath = path.resolve(__dirname, 'dist');
        const wrapperPath = path.join(distPath, 'mintegral-wrapper.html');
        const finalPath = path.join(distPath, 'mintegral.html');
        
        if (fs.existsSync(wrapperPath)) {
          // Читаем файл
          let html = fs.readFileSync(wrapperPath, 'utf-8');
          
          // Удаляем запрещенные атрибуты для Mintegral
          // 1. Удаляем type="module"
          html = html.replace(/\s+type="module"/g, '');
          
          // 2. Удаляем crossorigin
          html = html.replace(/\s+crossorigin/g, '');
          
          // 3. Удаляем rel="stylesheet" crossorigin (оставляем только rel="stylesheet")
          html = html.replace(/rel="stylesheet"\s+crossorigin/g, 'rel="stylesheet"');
          
          console.log('✅ Removed forbidden attributes (type="module", crossorigin)');
          
          // Удаляем старый если есть
          if (fs.existsSync(finalPath)) {
            fs.unlinkSync(finalPath);
          }
          
          // Записываем очищенный HTML
          fs.writeFileSync(finalPath, html, 'utf-8');
          
          // Удаляем wrapper файл
          fs.unlinkSync(wrapperPath);
          
          console.log('✅ Created clean mintegral.html (no CORS issues)');
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
        drop_console: false, // Оставляем console.log для отладки
        drop_debugger: true,
      },
    },
    cssCodeSplit: false,
    rollupOptions: {
      // Используем mintegral-wrapper.html как input
      input: path.resolve(__dirname, 'mintegral-wrapper.html'),
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
  },
});

