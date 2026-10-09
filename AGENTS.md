<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Checks before pushing

- Run `npm run lint` (oxlint with the anti-slop rules), `npm run knip`, and `npx tsc --noEmit -p .`. All three should pass.
- Lint's `anti-slop/require-readable-spacing` rule expects a blank line before a statement that follows a declaration. Write code that passes without fixes.
- Run `npx prettier --write` on the files you change. Some older dashboard files were already unformatted, so don't reformat files you didn't touch.

## Styling

- Use the `site-*` theme tokens (for example `bg-site-panel`, `text-site-text-muted`) instead of hardcoded colors like `bg-white`, so components follow the `.dark` theme.
