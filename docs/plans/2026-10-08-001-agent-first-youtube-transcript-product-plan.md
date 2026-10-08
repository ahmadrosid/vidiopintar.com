# Agent-first YouTube transcript product plan

## Goal

Make Vidiopintar a hosted MCP service that gives AI agents YouTube transcripts. Remove the consumer learning product and keep a small operator site for setup and service information.

## Product promise

An agent sends a YouTube URL or video ID and receives the matching transcript in timed segments. The service reports clear limits and errors when it cannot return the full transcript.

## Product boundary

- The primary customer is the person or team that configures an agent. The agent is the main runtime user.
- The only v1 content tool is `youtube_get_transcript`.
- The service returns transcripts and source metadata. It does not generate summaries, quizzes, or answers.
- The public site explains setup, access, limits, privacy, and service status.
- Write all visitor-facing copy and setup instructions in Bahasa Indonesia.
- Keep tool names, input fields, and stable error codes in English for agent compatibility.
- The v1 service uses hosted MCP over HTTP. Local stdio distribution is out of scope.
- Start with an invite-only beta and per-key usage limits. Add self-serve billing only after usage validates demand.

This hosted-service choice follows the business-to-agent goal. It does not follow the earlier local-only MCP plan.

## Current product and code evidence

The repository contains transcript retrieval, summaries, quizzes, video chat, notes, saved videos, YouTube discovery, profiles, billing, and admin tools. It has no MCP package in the indexed source tree. A prior plan describes a local stdio server with transcript, summary, and quiz tools.

The transcript cache currently returns a cached response before it selects a requested language. A cache hit can therefore return a different language than the caller requested. Fix this before the MCP tool relies on language selection.

## Tool contract

### Input

- Required: `video`, as a YouTube URL or video ID.
- Optional: `language`, as a preferred language code.
- Optional: `cursor`, to continue a large transcript response.

Accept only supported YouTube URLs and valid video IDs. Never fetch an arbitrary host supplied in `video`.

The service must check the API key and quota on every page request. A cursor binds to one video and language. A follow-up request must use that language or derive it from the cursor.

### Result

- Return timestamped segments with `text`, `start` in seconds, and `duration` in seconds.
- Return `video_id`, title when available, and the actual transcript language.
- Return a continuation cursor when the response reaches its documented size limit.
- Make cursors opaque, signed, and short-lived with an expiry. A cursor must not grant access without a valid API key.
- Reject changed, expired, or unsupported cursor versions.
- Bind each cursor to the transcript snapshot and next segment position. Pages must not repeat or skip segments.
- If the transcript snapshot expires, return an invalid-cursor error and require a new request.
- Never silently omit segments. A caller must be able to continue until the transcript ends.
- Return timed segments as JSON in MCP text content, with structured fields when the client supports them.
- Do not repeat the full transcript in a second content block.
- Mark transcript text as untrusted source content. Tell agents to treat it as data, not instructions.

### Errors

Return stable error codes for invalid video references, unavailable captions, unavailable videos, invalid credentials, invalid cursors, rate limits, and temporary provider failures. Mark temporary failures as retryable. Do not expose secrets or raw provider responses.

## Keep

- URL and video ID normalization.
- Transcript fetching, language selection, timed segments, metadata, and useful errors.
- Health checks, logs, and operational metrics needed to run the hosted service.
- A minimal public site with installation examples, authentication setup, supported inputs, limits, privacy, status, and support contact.
- Terms and privacy pages that match the hosted service and its data handling.

## Remove or retire

- Video chat and its API, prompts, and chat history.
- AI summaries and quizzes, their APIs, interfaces, and generation dependencies.
- Notes and saved-video library.
- YouTube search, recommendations, channels, trending, and explore pages.
- Consumer learning dashboards, onboarding, and engagement features.
- Consumer profile preferences, plan purchase pages, and transaction history.
- Internationalized copy, locale switching, locale cookies, and language selection for the website.
- Admin reports that only serve the retired features.
- CLI chat if it duplicates transcript access. Check active use and links before removal.

Keep account and admin code only where the hosted service needs it for operator access, API key issuance, key revocation, support, abuse control, or usage review. Do not keep consumer accounts by default.

## Implementation sequence

### 1. Settle service access and data rules

- Issue scoped API keys to invite-only beta operators.
- Add per-key request and usage caps before exposing a public endpoint.
- Authenticate and apply quotas before any transcript provider call.
- Store only a secure hash of each API key. Show the raw key once, and support revocation and rotation.
- Apply rate limits to all authenticated calls. Count returned transcript bytes toward usage limits, including cache hits.
- Count provider failures toward rate limits, but not returned transcript usage.
- Set transcript cache keys by video ID and actual language. Never serve a different language on a cache hit.
- Treat legacy cache entries without a known language as misses. Do not label them with the requested language.
- Ensure title availability does not depend on which request first filled the transcript cache.
- Set a maximum response size in bytes. Choose it through client tests and document it before beta.
- Set a cache retention period and document it. Do not store prompts or agent conversations.
- Review the transcript source terms, reliability, cost, and production-host access before launch.

### 2. Build the hosted MCP transcript path

- Add one hosted MCP endpoint and register `youtube_get_transcript`.
- Reuse the existing transcript code only after fixing its cache-language behavior.
- Enforce the response size limit and cursor rules. Verify that agents can fetch every segment across multiple calls.
- Keep authentication, quotas, and provider errors separate from transcript content.
- Keep the endpoint stateless across requests. Do not depend on one server process for cursor state.
- Keep operational logs free of API keys, full transcripts, and unnecessary user data.
- Label transcript text clearly as untrusted in the tool description and result.

### 3. Verify agent use

- Test setup and tool calls in at least two supported MCP clients.
- Confirm both clients show the transcript as source content, and the tool description warns agents against following transcript instructions.
- Test supported YouTube URL forms, reject a non-YouTube host, and test a valid ID.
- Test a language preference, a long transcript, unavailable captions, revoked credentials, a rate limit, an invalid cursor, and a temporary provider failure.
- Confirm the client receives timed segments, metadata, stable error codes, and continuation cursors.
- Publish only clients that pass this check in the setup guide.

### 4. Run a measured beta

- Run the hosted MCP beside the current product until the service passes its release gates.
- Measure time to first successful call, repeat use, provider success rate, response time, and cost per successful transcript.
- Set beta targets before inviting users. Use the beta to decide whether to widen access, change limits, or stop.
- Run a no-charge invite-only beta. Do not open an uncapped public endpoint or build self-serve billing yet.

### 5. Publish service information beside the current product

- Publish MCP setup and service information on a separate route while the current product remains available.
- Add access-request instructions for the invite-only beta.
- State that an operator issues beta API keys after approval.
- Keep supported clients, limits, privacy, status, and support information easy to find.
- The homepage now presents the hosted MCP service. Legacy app routes remain available during the sunset period.
- Remove the admin reporting pages and website locale switcher as requested. Keep admin access code only where active operator routes still use it.

### 6. Sunset the consumer product safely

- Inventory active users, stored data, deployed routes, and public links before removal.
- Choose and publish a sunset date before removing consumer access.
- Do not remove consumer access until the hosted MCP passes release gates and its setup path works for beta users.
- Preserve required user data access, export, deletion, and retention behavior through the sunset.
- After the announced sunset and completed user transition, make the MCP service the homepage and remove consumer navigation.
- Remove consumer routes and data only after transition and retention duties end.
- Remove tables, migrations, dependencies, and environment variables only after checking retained routes and rollback needs.
- Update README, deployment files, search metadata, and support content.
- Keep transcript-source implementation choices aligned with the hosted service and this tool contract.

## Release gates

- Two supported MCP clients can connect to the hosted endpoint with an API key.
- A valid tool call returns the requested transcript language and timed segments.
- A long transcript can be read to completion through cursors without silent loss or duplication.
- Invalid references, unavailable captions, invalid keys, revoked keys, rate limits, and temporary provider failures return the documented errors.
- Per-key caps stop excess usage before cost or abuse can grow without bound.
- The cache cannot return transcript text in the wrong language.
- Unknown-language legacy cache entries cannot satisfy a language-specific request.
- Cursor requests cannot skip or duplicate segments, cross video or language boundaries, or bypass key checks.
- The public site states transcript availability limits, cache retention, and support contact.
- Beta targets for use, reliability, latency, and cost are set before invitations go out.
- The consumer product has a published sunset path. Required user data remains available until its transition duties end.

## Main risks and responses

- **YouTube access can fail or change.** Test from the production host and state that some videos have no usable captions.
- **Transcript fetching can create cost or abuse.** Keep the beta invite-only and enforce per-key caps before public access.
- **Large transcripts can exceed agent context.** Use bounded responses and continuation cursors; disclose limits in tool metadata and docs.
- **Cache results can mismatch language.** Key cached results by the selected language and test cache hits.
- **Old cache data has no language identity.** Treat unknown-language entries as misses until the service can prove their language.
- **Cursor handling can leak or lose content.** Bind each cursor to its video and language, check the API key each time, and test page boundaries.
- **The service may not earn repeat use.** Measure beta activation, repeat calls, reliability, and cost before removing the current product.
- **Removing consumer features can harm current users.** Announce the sunset and preserve access, export, and deletion duties.
- **The old plan conflicts with this product direction.** Mark it superseded and keep one active implementation plan.

## Out of scope

- Local stdio MCP distribution.
- Summary, quiz, chat, notes, video search, or recommendations.
- Public self-serve billing in the invite-only beta.
- A consumer learning application or custom MCP client.
- Promising transcripts for videos without accessible captions.

## Implementation status (2026-10-08)

The beta implementation now has an HTTP MCP endpoint, one transcript tool, bearer API keys, revocation, request and output quotas, language-aware cache entries, and bounded transcript pages with encrypted cursors. The homepage and public setup route use Bahasa Indonesia. The homepage now describes the MCP service and uses the `deep-reef` React scene from ascii.rest. Admin reporting pages and website locale switching are removed. The transcript language selector remains in the legacy video app; other legacy routes remain active during the sunset period.

Local checks passed: production build, all 18 tests, and React Doctor changed-scope scan (91/100, no findings). An MCP SDK client discovered the tool and received the invalid-reference error; missing credentials returned `INVALID_CREDENTIALS`; the migration applied to a temporary SQLite database. Tests cover URL validation, cursor binding, expiry, tampering, version rejection, and page boundaries. A fresh `db:verify` check could not run because this checkout has no configured SQLite database file.

Release work remains. The production website still serves the old consumer page, and `/api/mcp` returns 404. A valid transcript request succeeded through Codex and returned 63 timed segments. A local quota check returned `429`; a revoked key returned `401`; and a daily output cap returned `USAGE_LIMIT_EXCEEDED`. A three-page test returned all 732 test segments in order, without gaps or repeats. Cursor checks rejected a different video and language. These checks used a temporary local database; they do not prove production behavior. YouTube also throttled an earlier request. Verify two named MCP clients and production-host access, set beta targets, run the invite-only beta, and arrange a safe production deployment before sunset work.

The current provider uses an unofficial YouTube transcript scraper. The user confirmed permission to use this source. Keep the confirmation with the launch record and continue to monitor provider terms and reliability. YouTube can still throttle the provider; local testing returned a temporary too-many-requests response.

The source tree has no active production deploy workflow. Deployment access exists as GitHub secret names, but the secrets were not read. Do not remove consumer routes until the sunset conditions in step 6 are met. `next-intl` remains while those legacy routes still use its message catalog.

## Verification update (2026-10-09)

The live homepage and `/mcp.md` now return HTTP 200. The homepage shows the Bahasa MCP setup, `youtube_get_transcript`, limits, privacy, and beta access. `/api/health` reports a healthy application and database. An unauthenticated MCP initialize request returns HTTP 401 with `INVALID_CREDENTIALS`. This confirms the production endpoint is present, but it does not verify a transcript call with a valid production key. No valid key was read or used.

The app now builds with Next.js 16.4.0 and React 19.3.0. Local build, test, Docker build, and React Doctor checks passed. GitHub React Doctor and Docker image builds passed. The upgrade is pushed to `main` as `a447698`.

The runner image no longer includes the Drizzle CLI and its build dependencies. The entrypoint applies migrations through the Drizzle ORM runtime already included with the app. Fresh and repeated migrations passed in a temporary SQLite database. The local image size fell from 336.2 MB to 294.8 MB. GitHub built and pushed the updated image from commit `6798446`.

The earlier production status above is stale: the homepage is no longer the old consumer page, and `/api/mcp` no longer returns 404. Production transcript verification, a second named MCP client, beta targets and results, a published consumer sunset date, and user transition remain open release gates. Do not remove legacy routes or deploy a new release before the required user approval and release gates.
