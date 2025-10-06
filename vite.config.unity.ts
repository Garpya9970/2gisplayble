import { defineConfig } from 'vite';
import path from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'fs';

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=ru.dublgis.dgismobile';
const APP_STORE_URL = 'https://apps.apple.com/ru/app/2gis-karty-navigator-druzya/id481627348';

export default defineConfig({
  plugins: [
    viteSingleFile({
      removeViteModuleLoader: true,
      useRecommendedBuildConfig: true,
    }),
    // Инжектим Unity Ads SDK в <head>
    {
      name: 'inject-unity-sdk',
      transformIndexHtml(html) {
        const sdkScript = `
    <!-- Unity Ads SDK & MRAID Mock -->
    <script>
      // Store URLs для Unity Ads
      window.GOOGLE_PLAY_URL = '${GOOGLE_PLAY_URL}';
      window.APP_STORE_URL = '${APP_STORE_URL}';
      
      // MRAID 3.0 Mock для локального тестирования
      if (!window.mraid) {
        window.mraid = (function() {
          var listeners = {};
          var state = 'loading';
          var isViewable = false;
          
          return {
            getVersion: function() {
              return '3.0';
            },
            
            addEventListener: function(event, listener) {
              if (!listeners[event]) {
                listeners[event] = [];
              }
              if (listeners[event].indexOf(listener) === -1) {
                listeners[event].push(listener);
              }
            },
            
            removeEventListener: function(event, listener) {
              if (listeners[event]) {
                var index = listeners[event].indexOf(listener);
                if (index !== -1) {
                  listeners[event].splice(index, 1);
                }
              }
            },
            
            fireEvent: function(event, data) {
              if (listeners[event]) {
                listeners[event].forEach(function(listener) {
                  listener(data);
                });
              }
            },
            
            getState: function() {
              return state;
            },
            
            isViewable: function() {
              return isViewable;
            },
            
            open: function(url) {
              console.log('[MRAID] open:', url);
              // Unity Ads откроет магазин приложений
              if (url) {
                window.open(url, '_blank');
              }
            },
            
            close: function() {
              console.log('[MRAID] close');
              // Unity Ads закроет рекламу
            },
            
            useCustomClose: function(value) {
              console.log('[MRAID] useCustomClose:', value);
            },
            
            expand: function() {
              console.log('[MRAID] expand');
            },
            
            getExpandProperties: function() {
              return { width: window.innerWidth, height: window.innerHeight };
            },
            
            setExpandProperties: function(props) {
              console.log('[MRAID] setExpandProperties:', props);
            },
            
            supports: function(feature) {
              // Unity Ads поддерживает все базовые MRAID функции
              return true;
            },
            
            getPlacementType: function() {
              return 'interstitial';
            },
            
            // Утилиты для тестирования
            __simulateReady: function() {
              state = 'default';
              this.fireEvent('ready');
            },
            
            __simulateViewableChange: function(viewable) {
              isViewable = viewable;
              this.fireEvent('viewableChange', viewable);
            }
          };
        })();
        
        // Автоматически имитируем готовность MRAID для локального тестирования
        setTimeout(function() {
          if (window.mraid && window.mraid.__simulateReady) {
            console.log('[MRAID Mock] Simulating ready event');
            window.mraid.__simulateReady();
            
            // Через 100мс имитируем viewableChange
            setTimeout(function() {
              console.log('[MRAID Mock] Simulating viewableChange(true)');
              window.mraid.__simulateViewableChange(true);
            }, 100);
          }
        }, 50);
      }
      
      // Unity Ads functions
      window.unityPlayableReady = function() {
        console.log('[Unity Ads] Playable ready');
      };
      
      window.unityPlayableStart = function() {
        console.log('[Unity Ads] Playable start');
      };
      
      window.unityPlayableClick = function() {
        console.log('[Unity Ads] Playable click (CTA)');
        var url = /iPhone|iPad|iPod/i.test(navigator.userAgent) 
          ? window.APP_STORE_URL 
          : window.GOOGLE_PLAY_URL;
        
        if (window.mraid && window.mraid.open) {
          window.mraid.open(url);
        } else {
          window.open(url, '_blank');
        }
      };
    </script>
`;
        
        // Вставляем SDK в <head>
        return html.replace('</head>', sdkScript + '\n  </head>');
      },
    },
    // Удаляем запрещенные атрибуты и переименовываем
    {
      name: 'unity-post-process',
      closeBundle() {
        const distPath = path.resolve(__dirname, 'dist');
        const indexPath = path.join(distPath, 'index.html');
        const unityPath = path.join(distPath, 'unity.html');
        
        if (fs.existsSync(indexPath)) {
          let html = fs.readFileSync(indexPath, 'utf-8');
          
          // Удаляем запрещенные атрибуты для Unity Ads
          html = html.replace(/\s+type="module"/g, '');
          html = html.replace(/\s+crossorigin/g, '');
          html = html.replace(/rel="stylesheet"\s+crossorigin/g, 'rel="stylesheet"');
          
          console.log('✅ Removed forbidden attributes for Unity Ads');
          
          // Удаляем старый если есть
          if (fs.existsSync(unityPath)) {
            fs.unlinkSync(unityPath);
          }
          
          // Записываем unity.html
          fs.writeFileSync(unityPath, html, 'utf-8');
          
          const sizeInMB = (Buffer.byteLength(html, 'utf-8') / 1024 / 1024).toFixed(2);
          console.log(`✅ Created unity.html (${sizeInMB} MB)`);
          
          if (parseFloat(sizeInMB) > 5) {
            console.warn('⚠️  Warning: File is larger than 5MB!');
          } else {
            console.log('✅ File size is within Unity Ads limits (< 5MB)');
          }
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
      mangle: {
        reserved: ['mraid', 'window', 'unityPlayableReady', 'unityPlayableStart', 'unityPlayableClick'],
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

