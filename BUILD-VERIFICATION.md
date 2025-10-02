# Проверка Single-File билда

## ✅ Что настроено

### 1. vite-plugin-singlefile
- **Плагин**: `vite-plugin-singlefile@^2.0.0`
- **Назначение**: инлайнит весь JS, CSS и ассеты в один HTML-файл

### 2. Настройки Vite
```typescript
// vite.config.ts
{
  plugins: [viteSingleFile()],
  build: {
    assetsInlineLimit: 100000000, // ~100 MB — инлайнить ВСЁ
    cssCodeSplit: false,           // Весь CSS в один блок
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // Весь JS в один блок
        manualChunks: undefined,    // Без chunk'ов
      }
    }
  }
}
```

## 🧪 Как проверить

### После `npm install && npm run build`:

1. **Проверить структуру `dist/`**:
   ```bash
   ls -la dist/
   # Ожидается ТОЛЬКО index.html (без папок assets/)
   ```

2. **Проверить содержимое `dist/index.html`**:
   ```bash
   cat dist/index.html | grep -c "<script>"
   # Должно быть: 1 (один инлайн <script>)
   
   cat dist/index.html | grep -c "<style>"
   # Должно быть: 1 или больше (инлайн <style>)
   
   cat dist/index.html | grep -c "data:image"
   # Должно быть > 0 (base64-изображения, если есть)
   ```

3. **Проверить, что нет внешних ссылок**:
   ```bash
   cat dist/index.html | grep -E '(href="[^d]|src="[^d])' 
   # Не должно быть http://, https://, ./assets/
   # Только data:... для base64
   ```

4. **Проверить размер файла**:
   ```bash
   du -h dist/index.html
   # Должно быть ≤ 5 MB (без ZIP)
   
   zip dist.zip dist/index.html
   du -h dist.zip
   # Должно быть ≤ 5 MB (ZIP, финальная проверка)
   ```

## ❌ Что НЕДОПУСТИМО в `dist/index.html`

```html
<!-- ❌ Внешние скрипты -->
<script src="./assets/index-abc123.js"></script>
<script src="https://cdn.jsdelivr.net/..."></script>

<!-- ❌ Внешние стили -->
<link rel="stylesheet" href="./assets/index-abc123.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/...">

<!-- ❌ Внешние изображения -->
<img src="./assets/logo.png">
<img src="https://example.com/image.png">
```

## ✅ Что ДОПУСТИМО

```html
<!-- ✅ Инлайн скрипт -->
<script>
(function(){
  "use strict";
  // ... минифицированный код ...
})();
</script>

<!-- ✅ Инлайн стили -->
<style>
*{margin:0;padding:0;box-sizing:border-box}
/* ... минифицированный CSS ... */
</style>

<!-- ✅ Base64-изображения -->
<img src="data:image/png;base64,iVBORw0KGgo...">
<div style="background-image:url(data:image/webp;base64,...)"></div>
```

## 🚀 Финальная проверка перед загрузкой в сети

```bash
# 1. Собрать билд
npm run build:mintegral-portrait

# 2. Проверить, что это один файл
ls -lh dist/

# 3. Открыть в браузере локально (file://)
open dist/index.html

# 4. Chrome DevTools → Network:
#    - Должно быть 0 запросов (кроме самого HTML)
#    - Нет внешних ресурсов

# 5. Проверить размер
du -h dist/index.html
zip dist.zip dist/index.html
du -h dist.zip  # Должно быть ≤ 5 MB
```

## 📋 Чек-лист перед загрузкой

- [ ] `dist/index.html` — один файл, нет папок `assets/`
- [ ] Открывается локально (file://) без ошибок
- [ ] Chrome DevTools → Network: 0 внешних запросов
- [ ] Размер ZIP ≤ 5 MB
- [ ] Работает на мобильных (portrait/landscape)
- [ ] Все события SDK срабатывают
- [ ] CTA работает (`sdk.install()`)

## 🔧 Troubleshooting

### Если всё ещё генерируются отдельные JS/CSS файлы:
1. Проверить, что `vite-plugin-singlefile` установлен: `npm list vite-plugin-singlefile`
2. Проверить, что плагин импортирован: `import { viteSingleFile } from 'vite-plugin-singlefile'`
3. Проверить, что плагин добавлен в `plugins: [viteSingleFile()]`
4. Удалить `dist/` и пересобрать: `rm -rf dist && npm run build`

### Если изображения не инлайнятся:
1. Проверить `assetsInlineLimit: 100000000` в `vite.config.ts`
2. Убедиться, что изображения импортируются через `import logo from './logo.png'`, а не через `<img src="./logo.png">`


