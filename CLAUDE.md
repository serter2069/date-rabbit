# DateRabbit

## Local Development

Secrets: **Doppler** (workspace: Sergei MSP, project: `date-rabbit`, config: `dev`)

```bash
doppler login      # один раз на машину
daterabbit-dev     # запускает backend + expo + SSH туннель к DB
```

- **Backend:** http://localhost:3004
- **Web app:** http://localhost:8083
- **DB:** staging via SSH туннель (localhost:5435 → 91.98.205.156:5432/daterabbit)
- **Auth:** `DEV_AUTH=true` → OTP всегда `000000`

Управление секретами:
```bash
doppler secrets --project date-rabbit --config dev
doppler secrets set KEY=value --project date-rabbit --config dev
# или через UI: dashboard.doppler.com
```

---

## 🔐 Тестовая авторизация

**Staging: DEV_AUTH=false** -- OTP отправляется на email через Brevo.

**Локальная разработка: DEV_AUTH=true** -- OTP всегда `000000`, email НЕ отправляется.

**URLs:**
- Staging: `https://daterabbit.smartlaunchhub.com`
- API: `https://daterabbit-api.smartlaunchhub.com/api`
- Local: `http://localhost:8081` (app), `http://localhost:3004/api` (API)

---

## Tasks & Bugs (diagrams.love)
**Schema:** https://diagrams.love/canvas?schema=cmm9ykbh20003ll81v26ea4zj

---

## Project Info

- **Type:** React Native / Expo
- **GitHub:** github.com/serter2069/date-rabbit

## Hydra Sub-Agent Tool

Classify the task before choosing a mode. Hydra is for file-driven
orchestration, not the default path for every change.
Hydra treats `result.json` + `done` as the only completion evidence.
Terminal conversation is not a source of truth.

Core rules:
- Root cause first. Fix the implementation problem before changing tests.
- Do not hack tests, fixtures, or mocks to force a green result.
- Do not add silent fallbacks or swallowed errors.
- A handoff is only complete when both `result.json` and `done` exist and pass schema validation.

Workflow patterns:
1. Do the task directly when it is simple, local, or clearly faster without workflow overhead.
2. Use a single implementer workflow when you still want Hydra evidence and retry control:
   `hydra run --task "<specific task>" --repo . --template single-step [--worktree .]`
3. Use the default planner -> implementer -> evaluator workflow for ambiguous, risky, or PRD-driven work:
   `hydra run --task "<specific task>" --repo . [--worktree .]`
   - If the user says all roles should use one provider, pass `--all-type <provider>`.
   - If the user wants a mix, pass `--planner-type`, `--implementer-type`, and `--evaluator-type`.
   - If the user does not specify providers, Hydra should prefer the current terminal's provider when available.
4. Use a direct isolated worker primitive when the split is already known and you do not need a full workflow:
   `hydra spawn --task "<specific task>" --repo . [--worktree .]`

Agent launch rule:
- When dispatching Claude/Codex through TermCanvas CLI, start a fresh agent terminal with `termcanvas terminal create --prompt "..."`
- Do not use `termcanvas terminal input` for task dispatch; it is not a supported automation path

Workflow control:
- After `hydra run` or `hydra spawn`, immediately start polling with `hydra watch`. Do not ask whether to watch — always watch.
1. Inspect one-shot progress: `hydra tick --repo . --workflow <workflowId>`
2. Watch until terminal state: `hydra watch --repo . --workflow <workflowId>`
3. Inspect structured state and failures: `hydra status --repo . --workflow <workflowId>`
4. Retry a failed/timed-out workflow when allowed: `hydra retry --repo . --workflow <workflowId>`
5. Clean up runtime state or worktrees: `hydra cleanup --workflow <workflowId> --repo .`

Telemetry polling:
1. Treat `hydra watch` as the main-brain polling loop; do not infer progress from terminal prose alone.
2. Before deciding wait / retry / takeover, query:
   - `termcanvas telemetry get --workflow <workflowId> --repo .`
   - `termcanvas telemetry get --terminal <terminalId>`
   - `termcanvas telemetry events --terminal <terminalId> --limit 20`
3. Keep waiting when telemetry shows recent meaningful progress, `thinking`, `tool_running`, `tool_pending`, or a foreground tool.
4. Treat `awaiting_contract` as "turn complete, file contract still pending".
5. Treat `stall_candidate` as "investigate before retry", not automatic failure.

Worker control:
1. List direct workers: `hydra list --repo .`
2. Clean up a direct worker: `hydra cleanup <agentId>`

`result.json` must contain:
- `success`
- `summary`
- `outputs[]`
- `evidence[]`
- `next_action`

When NOT to use: simple fixes, high-certainty tasks, or work that is faster to do directly in the current agent.
