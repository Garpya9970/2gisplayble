# Adaptive Visuals (строго)

1) Все размеры (font-size, padding, margin, gap, border-radius, icon-size и т. п.) —
   только через `clamp(min, pref, max)` с единицами `vw/vh/em/rem`.
2) Изображения/блоки — `max-width`, `max-height`, `object-fit: cover/contain`.
3) Размеры зон (HUD/кнопки/оверлеи) — тоже через `clamp()`.
4) НИКОГДА не задавать фиксированные `px` для шрифтов и контейнеров.
5) Учитывать safe-area: `padding: env(safe-area-inset-*)`.
6) Если нужен scale — через CSS-переменную `--scale`, но базовые размеры остаются относительными.
7) CTA — зона касания ≥ ~44×44 (в относительных ед.), читаемый текст.
