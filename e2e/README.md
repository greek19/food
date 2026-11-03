# FOOD browser verification

Run `npx playwright install chromium`, then `npm run test:e2e`.
The configuration starts Vite on port 4174 and checks desktop Chromium and an emulated iPhone 13 viewport.

The fixture mounts the same application with the demo adapter. It does not load Supabase configuration
or use real credentials, and it is not included in the production build.
Each test gets an isolated browser context.

Coverage includes the calendar, generation, keyboard recipe search, individual portions,
persistence after reload, balancing proposals and saves, internal modal scrolling, Escape and focus return,
optional meals, logout, malformed/duplicate JSON, shopping checks, and photo validation/preview/persistence.

Planner screenshots and failure traces are written to `test-results/`, which Git ignores.

Limitations: mobile Chromium emulation is not Safari on a real device. These tests do not verify
Supabase email/password authentication, synchronization between remote sessions, or the real project's RLS policies.
See [integration checks](../integration/README.md) for local SQL tests and opt-in live checks.
