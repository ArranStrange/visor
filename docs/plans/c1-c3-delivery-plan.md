# Visor C1–C3 Delivery Plan — FINAL (signed off 5/5 SHIP by Elite Review Team, 2026-08-25)

Scope: #117 (camera-first personalisation), #118 (account safety), #119+#78 (discovery search/sort), bounded #120 (SEO). Process: branch per phase, small conventional commits, Gestalt Elite Review on each diff with VERDICT: SHIP/HOLD, merge only on unanimous SHIP, side findings → issues. Coding by Opus 4.8 agents. This file is committed to the repo as `docs/plans/c1-c3-delivery-plan.md` in Phase 0 so reviewers can read it inside the project boundary.

Resolved decisions (panel votes):
- **Q1** Keep `filter: JSON` accepted for exactly one release (4–1), but BOTH the JSON arg and the new typed inputs route through one validated builder (reject unknown keys + `$`-prefixed values) **landing in the first commit of Phase 1**. File a dated removal task issue.
- **Q2** Account deletion = anonymise-and-tombstone (5–0). Plus: auth middleware must null `req.user` for tombstoned users (`deletedAt` check — without this, existing JWTs keep authenticating as the tombstone for up to 7 days); scramble the password hash on tombstone; destructive ops require current password.
- **Q3** Popularity sort = denormalised `popularityScore` maintained by `$inc` at each mutation (download +3, save +2, like +1), indexed, `createdAt` desc tiebreak. Enum value `POPULAR` and UI label "Popular" — not "Trending" — so the UI doesn't promise an algorithm the implementation doesn't provide (per sol).
- **Q4** Zero-dep `useDocumentMeta` hook (4–1 nominal, sol caveat adopted): hook + robots.txt + build-time sitemap now, with the honest caveat recorded in the PR that client-side OG tags are invisible to non-JS social scrapers; build-time static OG shells for top recipes filed as a follow-up issue.
- **Q5** reCAPTCHA deferred (5–0). Ship honeypot field + in-memory per-IP/per-user rate limiting (explicitly in-memory-on-single-instance, no Redis assumed) on `register`, `requestPasswordReset`, `changeEmail`, `deleteAccount`, `reportContent`. Context gains `req` now (rate limiting needs the IP). **Delete `server/utils/recaptchaService.js` entirely** (it contains a production-bypass backdoor and must not remain as an accidentally reusable path); file a follow-up issue for real reCAPTCHA if spam appears.
- **Q6** Phase 2 split into 2a (auth lifecycle) and 2b (moderation) — two branches, two reviews. `likeFilmSim`/likes-model fix (#128) becomes the FIRST commits of Phase 3, with backfill before the resolver flip.

Per-commit review gate (from test-error-predictor, endorsed by fable-5): every schema addition lands with the hand-edited `client/src/types/graphql.ts`, affected mocks, and pagination-policy test updates in the SAME commit.

---

## Phase 0 — `as/ci-and-prereqs`
1. Fix the 20 unused-symbol tsc errors; add client `"typecheck": "tsc --noEmit"`; extend tsconfig `exclude` to cover `.tsx` tests. Closes #96.
2. `.github/workflows/ci.yml`: client lint + typecheck + vitest; server node --test. (Progress on #91; Cypress stays manual.)
3. `isAdmin: { type: Boolean, default: false }` on User model. Confirm it is NOT settable via `updateProfile`'s allow-list. Closes #125.
4. Remove placeholder `crypto` dep. Closes #131.
5. Shared `escapeRegExp` in `server/utils/`; apply at the four unescaped regex sites (discussion ×2, list, user). Closes #127.
6. Commit this plan as `docs/plans/c1-c3-delivery-plan.md`.
Exit: CI green, `npx tsc --noEmit` 0 errors, server tests green, 5/5 SHIP, merge.

## Phase 1 — `as/camera-first-personalisation` (#117, closes #126)
Server:
1. First commit: single validated filter builder (allow-list + `$` rejection); typed `PresetFilterInput`/`FilmSimFilterInput` (`tagId`, `featured`, `sensorKey`, `cameraName`, temp `title`); `filter: JSON` still accepted through the same builder; file dated-removal issue.
2. Idempotent, dry-runnable backfill `compatibleCameras`→`compatibleSensors` (logs counts before writing); fallback resolver stays one release.
3. Export `sensorKeyForCamera` server-side; drift test extended AND asserting non-zero parse count; regex updated in the same commit as any catalogue shape change.
Client:
4. `features/compatibility/` service extracted from `dialIn.ts` + `fujifilmSensors.ts` → five-state `CompatibilityVerdict` (FITS / FITS_WITH_SUBSTITUTIONS / PARTIAL{lost} / UNVERIFIED / INCOMPATIBLE). `getSensorCompatibilityWarnings` becomes an adapter; `buildDialInSteps` consumes the verdict and stays pure; the 28 dial-in tests stay green.
5. `CameraContext` (inside AuthProvider, outside ContentTypeProvider), storage key `visor_primary_camera`, AuthContext lazy-read pattern, `showAllGenerations` in context. **Camera stored as canonical normalized-name key (via `normalizeCameraName`), never display string**; server validates `primaryCamera` against the catalogue. `primaryCamera` added to User + `updateProfile` allow-list + `types/graphql.ts`; cleared from localStorage on logout.
6. Navbar body picker + unset-state nudge.
7. Wiring: typed filter gets flat `sensorKey` when camera set && !showAllGenerations; five-state verdict chips on film-sim cards/detail; flag `VITE_ENABLE_CAMERA_FILTER` via ENV_CONFIG.
8. Tests: AST contract test for the new inputs; compatibility-service unit tests (all five states); CameraContext tests.

## Phase 2a — `as/account-safety-auth` (#118 part 1; fixes #129 env)
1. Password reset: `resetTokenHash` (SHA-256) + `resetTokenExpiry` (1h), distinct from verification fields; hash the existing plaintext `verificationToken` too; `requestPasswordReset(email)` always-true (no enumeration, uniform responses); `resetPassword(token, email, newPassword)` nulls `resetTokenHash` on success AND on any login (replay prevention). New SendGrid template + 10-line template test + shared layout extraction. Client `/forgot-password`, `/reset-password` routes + Login link. Set `APP_URL`/SendGrid vars in render.yaml (closes #129).
2. `changePassword(current, new)`; `changeEmail(password, newEmail)` verifies the NEW address before switching. `validatePassword` min 8; extract client duplicate.
3. Credential-change revocation: `credentialsChangedAt` on User; auth middleware rejects JWTs with `iat` older.
4. Account deletion: tombstone (rename `deleted_user_<id>`, null PII, scramble password hash, `deletedAt`), hard-delete Loadouts + Notifications + tokens; **auth middleware nulls tombstoned users** (+ test); requires current password; Cloudinary revocation documented out of scope; hard-erasure as an idempotent manual script.
5. Honeypot + in-memory rate limiting (register, requestPasswordReset, changeEmail, deleteAccount); context gains `req`; **delete recaptchaService.js**; check `registration-security.cy.ts` first.
6. `/terms`, `/privacy` static non-lazy pages (content drafted for founder review before merge; theme tokens only — see #133).
7. Cleanup: orphan `localStorage["token"]` writes; EmailVerification uses AuthContext.updateUser.

## Phase 2b — `as/account-safety-moderation` (#118 part 2)
1. `requireAdmin` helper in authHelpers (migrate the 12 hand-rolled sites opportunistically).
2. `Report` model {reporter, targetType PRESET|FILMSIM|IMAGE|DISCUSSION_POST, targetId, reason, detail, status OPEN|ACTIONED|DISMISSED, resolvedBy, resolvedAt} + {status,createdAt} index; typeDefs + resolvers registered in BOTH merge arrays; `reportContent` (auth + rate-limited), `listReports`/`resolveReport` admin-only.
3. Client: "Report" in existing ⋮ menus + minimal `/admin/reports` gated by `useIsAdmin`; theme tokens only.

## Phase 3 — `as/discovery-search-sort` (#78, #119, bounded #120; fixes #128)
1. FIRST commits: #128 fix — FilmSim `likes` → `[ObjectId ref User]` + `likeCount`, backfill numeric counts BEFORE flipping the resolver; implement `likeFilmSim`/unlike with auth; fix `likePreset` (auth, null guard, unlike); expose `FilmSim.downloads`.
2. Counters: `likeCount`/`saveCount`/`downloads`/`popularityScore` on both types, `$inc` in like/list/download mutations; `downloadPreset` → `findByIdAndUpdate` + `$inc` + auth + null guard; idempotent backfill.
3. Indexes: `{createdAt:-1}`, `{downloads:-1}`, `{likeCount:-1}`, `{saveCount:-1}`, `{popularityScore:-1}`, `{featured:1}` on both. Text-index replacement deferred.
4. `search: String` + `sort: ContentSort` (NEWEST | POPULAR | MOST_DOWNLOADED | MOST_SAVED) on both list queries; escaped-regex `$or` over title/name, description, notes + tag-name join (searchDiscussions shape).
5. afterImage predicate into Mongo so counts match pages; film sims stay listable without images.
6. Client search: delete `filterBySearchQuery`; 300ms debounce; repoint `SEARCH_PRESETS` **including `RecommendedPresetsManager.tsx` and `ItemAutocomplete.tsx`** (glm finding); `DOWNLOAD_PRESET` fire-and-forget at the `downloadXMP` call site.
7. `keyArgs` → `["filter","limit","search","sort"]` with pagination-policy test matrix extended BEFORE the change; cypress cache spec updated.
8. Sort control in `ContentTypeFilter` (no new provider); mutually exclusive with shuffle; must survive sensor mode.
9. Bounded SEO: `useDocumentMeta` hook per route; static robots.txt; fail-soft build-time sitemap script (API down → previous/empty sitemap + warning, never a hard build fail); OG tags with Cloudinary-transformed sample image + honest caveat in PR; follow-up issue for static OG shells.

## Cross-cutting
- Every GraphQL change: types/graphql.ts + mocks + policy tests in the same commit.
- No Apollo Server 4 migration in these branches (#132 standalone).
- New UI uses theme tokens (#133).
- Review gate: full-branch diff, all five reviewers, `VERDICT: SHIP` unanimous → push, PR (`Closes #…`), merge. Plans/diff summaries live inside the repo so every reviewer can read them.
