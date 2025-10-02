# Events Contract (универсальные имена)

Обязательные:
- `game_start`
- `first_interact`
- `level_complete` { win: boolean, time_ms: number }
- `cta_click`
- `error` { code: string, detail?: string }

Опциональные (если доступны в SDK):
- `pause`
- `resume`
- `volume` { muted: boolean, level?: number }

Правило: в коде всегда `sdk.track(<name>, payload?)` ровно с этими именами.
