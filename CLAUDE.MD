## Core instructions
- Read `./docs/project-context.md` before proposing architecture changes to the grid.
- Treat `./docs/project-context.md` as the source of truth for grid architecture, performance invariants, rendering modes, and editing/selection design.
- Keep changes minimal and scoped, unless the current code doesn't use best practices and can be improved
- Preserve existing public API and runtime behavior unless the task explicitly requires a change.
- Prefer analysis first, then plan, then implementation.
- Before changing performance-sensitive code, identify re-render risks and hot paths.
- For grid work, do not move selection/edit state into React state on the hot path unless explicitly justified.
- Run relevant tests after meaningful code changes.
- If anything in the prompt or requirements is unclear, ask questions before acting. Do not assume intent or fill gaps silently.
