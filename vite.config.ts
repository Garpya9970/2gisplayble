import { defineConfig } from 'vite';
import path from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    viteSingleFile({
      removeViteModuleLoader: true, // Удалить Vite module loader
      useRecommendedBuildConfig: true, // Использовать рекомендуемую конфигурацию
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.obj', '**/*.mtl', '**/*.FBX', '**/*.glb', '**/*.gltf'], // Разрешить импорт OBJ/MTL/FBX/GLB файлов
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 100000000, // Инлайнить все ассеты (100 MB лимит = всё инлайнится)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // временно включаем console.log для отладки
        drop_debugger: true,
      },
    },
    cssCodeSplit: false, // Весь CSS в один файл
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // Инлайнить динамические импорты
        manualChunks: undefined, // Единый бандл
      },
    },
  },
  define: {
    'import.meta.env.VITE_AD_NETWORK': JSON.stringify(process.env.AD_NETWORK || 'mintegral'),
    'import.meta.env.VITE_ORIENTATION': JSON.stringify(process.env.ORIENTATION || 'portrait'),
  },
});
