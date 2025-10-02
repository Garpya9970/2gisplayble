# Task 01 — Инициализация проекта

## Цель
Создать структуру проекта с TypeScript, настроить сборку (Vite/esbuild), линтер, базовую HTML-структуру.

## Описание
- Инициализировать `package.json` с зависимостями: TypeScript, Vite, **vite-plugin-singlefile**, ESLint.
- Настроить **single-file билд**: `vite-plugin-singlefile` для генерации одного HTML с инлайн JS/CSS и base64-изображениями.
- Создать `tsconfig.json` с strict-режимом.
- Создать `src/index.html` с базовой структурой (viewport, meta-теги, safe-area-inset).
- Создать `src/main.ts` с точкой входа.
- Настроить `.gitignore` (node_modules, dist).
- **Критично**: итоговый билд — **один HTML-файл** для загрузки в рекламные сети.

## Технические требования
- TypeScript ≥4.9
- Vite + vite-plugin-singlefile для single-file билда
- Структура директорий: `src/`, `src/assets/`, `dist/`
- **Итоговый билд**: `dist/index.html` — один файл с инлайн кодом и base64-ассетами
- `assetsInlineLimit: 100000000` — инлайнить все изображения как base64

## Acceptance
- [x] `package.json` создан с зависимостями (TypeScript, Vite, Three.js, **vite-plugin-singlefile**, ESLint).
- [x] `tsconfig.json` настроен (strict mode, ES2020, path aliases).
- [x] `vite.config.ts` настроен:
  - [x] `viteSingleFile()` плагин подключен
  - [x] `assetsInlineLimit: 100000000` — все ассеты инлайнятся как base64
  - [x] `cssCodeSplit: false` — весь CSS инлайн
  - [x] `inlineDynamicImports: true` — весь JS инлайн
  - [x] Минификация (terser, drop_console)
  - [x] Env-переменные для AD_NETWORK/ORIENTATION
- [x] `.eslintrc.json` настроен (TypeScript правила).
- [x] `.gitignore` создан (node_modules, dist, *.zip).
- [x] `src/index.html` создан (viewport, safe-area-inset, прелоадер, canvas для Three.js).
- [x] `src/main.ts` создан (точка входа, глобальный обработчик ошибок, TODO для Task 02-19).
- [x] Структура директорий создана: `src/`, `src/assets/`, `src/renderer/`, `src/game/`, `src/ui/`, `src/screens/`.
- [x] `README.md` создан с документацией по проекту.
- [x] `npm install` выполнен ✅ (пользователь установил все зависимости).
- [x] `vite-plugin-singlefile` доустановлен ✅.
- [x] `terser` доустановлен для минификации ✅.
- [x] `index.html` перемещён в корень проекта (требование Vite).
- [x] `npm run build` создаёт **ОДИН файл** `dist/index.html` (3.6 KB) с инлайн JS/CSS ✅.
- [x] Проверено: `dist/` содержит только `index.html`, нет папок `assets/` ✅.
- [x] `npm run dev` запускает dev-сервер ✅.

## Оценка
~1 час
