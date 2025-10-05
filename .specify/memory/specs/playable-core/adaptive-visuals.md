# Adaptive Visuals (строго)

1) Все размеры (font-size, padding, margin, gap, border-radius, icon-size и т. п.) —
   только через `clamp(min, pref, max)` с единицами **`vmin/vh`** (БЕЗ px и rem!).
   - **Portrait**: используем `vmin` (меньшая сторона viewport)
   - **Landscape**: используем `vh` (высота viewport, не vmax!)
   - Пример: `clamp(12vmin, 20vmin, 25vmin)` для кнопок в portrait, `clamp(10vh, 15vh, 20vh)` в landscape
2) Изображения/блоки — `max-width`, `max-height`, `object-fit: cover/contain`.
3) Размеры зон (HUD/кнопки/оверлеи) — тоже через `clamp()` с `vmin/vmax`.
4) **НИКОГДА** не задавать фиксированные `px` или `rem` для шрифтов и контейнеров.
5) Учитывать safe-area: `padding: env(safe-area-inset-*)`.
6) Если нужен scale — через CSS-переменную `--scale`, но базовые размеры остаются через `vmin/vmax`.
7) CTA — зона касания ≥ ~44×44 (в относительных ед. vmin), читаемый текст.

## Почему vmin/vh?

- **Portrait**: `vmin` = меньшая сторона viewport (width в portrait)
- **Landscape**: `vh` = высота viewport (не vmax, чтобы избежать огромных элементов на широких экранах!)
- Элементы **автоматически адаптируются** при повороте экрана
- Пропорции сохраняются на **любых** устройствах
- Работает идентично на iPhone, Android, планшетах, desktop

### Почему vh а не vmax в landscape?
`vmax` в landscape = ширина экрана. На широких экранах (например 1920x1080) элементы становятся огромными (15vmax = 288px!).
`vh` в landscape = высота экрана. Элементы остаются пропорциональными и читаемыми.
