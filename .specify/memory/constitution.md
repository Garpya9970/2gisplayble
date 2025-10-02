Playable Ads — Project Constitution
0. Purpose

Единые правила разработки HTML5-плейблов: адаптивный UI, кросс-сетевой рантайм через @smoud/playable-sdk, прозрачные сборки, строгая приёмка.

1. Non-negotiable Budgets & Constraints

Вес: ZIP ≤ 5 MB (prod).

Производительность: 60 FPS на mid-tier Android/iOS; TTFI ≤ 300 ms.

Сеть: внешние запросы = 0 в рантайме; web-fonts = 0.

Ориентации: поддерживаем portrait и landscape (разные билды).

Совместимость: без зависимости от внешних CDN; всё в бандле.

2. Adaptive Visuals (UI/UX)

Все размеры/шрифты/отступы/радиусы/иконки — только через
clamp(min, preferred, max) с единицами vw/vh/em/rem.

Запрещено: фиксированные px для шрифтов и контейнеров.

Медиа/блоки: max-width, max-height, object-fit: cover/contain.

Учитывать safe-area: padding: env(safe-area-inset-*).

Если используется масштабирование — через --scale, базовые размеры остаются относительными.

CTA: заметность, зона касания ≥ ~44×44 (в относительных ед.), доступность текстов.

3. Runtime SDK (Playable SDK)

Используем @smoud/playable-sdk как единую точку интеграции с сетями.

Базовые вызовы:

sdk.init(cb?) → подготовка сцены/ресурсов;

sdk.on('resize'|'pause'|'resume'|'volume'|'interaction', handler) — при необходимости;

sdk.start() / sdk.finish();

sdk.install() — единственный способ EXIT (никаких window.open).

События: вызываем только абстрактными именами (см. Event Contract).

Запрещено: любая логика «если Meta/Google/…» в UI-коде. Различия решает SDK/сборка.

4. Event Contract (абстрактные имена)

Обязательные:

game_start

first_interact

level_complete { win: boolean, time_ms: number }

cta_click

error { code: string, detail?: string }

Опциональные (если доступны в SDK):
pause, resume, volume { muted: boolean, level?: number }.

Правило: события вызываются ровно в определённых местах (см. Instrumentation Map per-game) и ровно один раз, если не оговорено иначе. Если в сети нет аналога — SDK/адаптер их игнорирует, приложение не падает.

5. Build Targets & Tooling

Сборка выполняется CLI из экосистемы (например, @smoud/playable-scripts):
npm run build <ad-network>; ориентации — отдельные таргеты.

Все различия по сетям/ориентациям — на этапе сборки; UI-код общий.

В прод-бандле должны находиться: SDK, ассеты, код — без загрузок извне.

Автопроверки (рекомендуется):

zip-check: fail, если ZIP > 5 MB;

net-check: fail, если обнаружены http(s):// в рантайме.

6. Rendering Stack

Разрешено: 2D (Canvas / Pixi.js / Phaser) или 3D (Three.js / Babylon.js / PlayCanvas).

Условие: соблюдение бюджета по весу/перфу, отсутствие внешних запросов.

Выбор библиотеки должен быть обоснован в планах (почему, какого размера бандл, как обеспечиваем 60 FPS).

7. Workflow (Spec → Plan → Tasks → Code → QA)

Спецификация фичи:
specs/playable-core/spec.md (ядро),
adaptive-visuals.md, events-contract.md, integrations/playable-sdk.md,
instrumentation-map.md (под конкретную игру).

План: генерируется в plan.md (Workstreams: Adaptive, Rendering(2D/3D), Gameplay, SDK, Build/Perf, QA).

Задачи: tasks/*.md, каждая ≤ 1–2 часа, с Acceptance на основе этого документа.

Имплементация: сначала SDK-wiring (init/on/start/finish, привязка событий и CTA), затем игровой код.

QA/Checks: вес, сеть, адаптив, корректность событий.

8. Acceptance (DoD)

Вес/перф: ZIP ≤ 5 MB; 60 FPS; TTFI ≤ 300 ms.

Сеть: 0 внешних запросов; web-fonts = 0; все ассеты локальные.

Адаптив: UI соответствует разделу 2 (ревью и визуальная проверка).

События/CTA: события по Event Contract срабатывают по Instrumentation Map;
CTA: track('cta_click') → sdk.install(); нет использования window.open.

Ориентации: оба билда (portrait/landscape) проходят smoke-тест и DoD.

9. Code Style & Safety

TypeScript (рекомендуется): строгие типы для событий и SDK-вызовов.

Никаких «плавающих» глобальных таймеров/сетевых ретраев.

Исключения: глобальный обработчик → sdk.track('error', {...}), минимум деталей.

10. For AI Assistants (Cursor/Copilot/Claude и др.)

Всегда выполняй шаги в этом порядке:

Прочитай файлы:
.specify/memory/constitution.md,
specs/playable-core/spec.md,
adaptive-visuals.md, events-contract.md, integrations/playable-sdk.md, instrumentation-map.md.

Сначала сгенерируй plan.md, потом tasks/*.md (≤1–2 часа каждая).

Реализуй задачи без добавления зависимостей, кроме оговорённых библиотек.

События:

game_start — после sdk.init() и готовности сцены;

first_interact — первый пользовательский ввод (one-shot);

level_complete — на концовке с { win, time_ms };

CTA-кнопки: по click всегда sdk.track('cta_click') → sdk.install();

error — в глобальном обработчике и контролируемых catch.

Запрещено:

window.open для EXIT;

фиксированные px для шрифтов/контейнеров;

внешние запросы;

логика «if Meta/Google/…» в UI-коде.

После генерации кода запусти self-check по DoD (раздел 8) и укажи, чем подтверждаются пункты.

Если в спеках нет данных — предложи безопасный дефолт и коротко спроси подтверждение.

11. Governance

Эта Конституция имеет приоритет над устными договорённостями.

Любые исключения должны быть документированы в PR: обоснование, влияние на бюджет/перф, план отката.

Изменения Конституции — через PR с согласованием ответственного.

Version: 1.0.0 | Ratified: YYYY-MM-DD | Last Amended: YYYY-MM-DD