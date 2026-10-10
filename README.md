# MandiSetu

Independent frontends for the B2B manufacturer marketplace, plus a NestJS/PostgreSQL API foundation. The users application now uses Roxodeal branding and a navy and gold layout based on the supplied reference, with industry cards, quick RFQ, suppliers and wholesale products. The original HTML and CSS are preserved in `users/template-source/`. Seller and admin applications remain independent.

## Project folders

```text
users/           Independent public marketplace and buyer Next.js application
seller/          Independent supplier Next.js application
admin/           Independent administrator Next.js application
backend/         Independent NestJS API, Prisma, Docker, deployment and API scripts
.github/         GitHub Actions workflow (GitHub requires this location)
```

Each application owns its components, styles, assets, configuration, package.json, package-lock.json and node_modules. There is no frontend/ wrapper, shared/ folder, shared package or source import between applications. Root package.json only provides optional command shortcuts and development tooling.

Run the applications independently: users on port 3000, seller on port 3001, admin on port 3002 and backend on port 4000. Cross-application links use NEXT_PUBLIC_USERS_URL, NEXT_PUBLIC_SELLER_URL and NEXT_PUBLIC_ADMIN_URL from each app’s own configuration.

## Docker backend, PostgreSQL and Redis

See [backend/deploy/DOCKER.md](backend/deploy/DOCKER.md) for local containers, migrations, persistent storage and the GitHub Actions → GHCR → Ubuntu VPS deployment pipeline.

```powershell
cd backend
node scripts/setup-docker-env.mjs
docker compose --env-file .env.docker -f compose.yml -f compose.dev.yml up -d --build --wait
docker compose --env-file .env.docker -f compose.yml -f compose.dev.yml run --rm --no-deps backend node prisma/seed.js
```

## Run the frontend

Requires Node.js 22+ and npm. In PowerShell use `npm.cmd` if script execution is disabled.

```powershell
npm.cmd --prefix users ci
npm.cmd --prefix seller ci
npm.cmd --prefix admin ci
npm.cmd --prefix backend ci
# Start each frontend in a separate terminal:
npm.cmd run dev:users
# npm.cmd run dev:seller
# npm.cmd run dev:admin
```

Open http://localhost:3000 for users, http://localhost:3001 for sellers, and http://localhost:3002 for admins. Each app serves its own panel routes:

- `/buyer/dashboard` — sourcing overview, free requirements, product shortlist, profile, protection and claims.
- `/seller/dashboard` — products, category-matched leads, credit unlocks, subscription, KYC, claim responses and profile.
- `/admin/dashboard` — suppliers, KYC review, lead pricing/status, plans, claims, content and reports.

These applications are explicitly an **interactive design preview**. Each origin has independent local preview data; edits do not sync between applications until the live API is connected. It uses seeded sample data and local browser storage; panel access is open for review. Choosing a workspace is not authentication. Refresh preserves edits, while signing out clears only the selected workspace. To reset data, remove the `mandisetu-preview-v1` local-storage entry using browser dev tools.

## Working preview interactions

- Catalogue search and category, location, maximum price, MOQ and verified-supplier filters.
- Public product and supplier detail pages and saved products.
- React Hook Form + Zod requirement validation; free submission with pending status.
- Product creation/editing/deactivation with the supplier plan listing cap.
- Category-matched lead access. One credit unlocks a lead, duplicate unlocks are prevented, and contact is locked until unlock. Five supplier slots maximum.
- Manual KYC statuses, admin lead prices/statuses, editable plan limits/credits.
- Buyer claims, seller responses, manual admin decisions and approved-compensation list.
- CMS About/FAQ editing, notification feed and CSV report export.
- Responsive layouts and mobile panel navigation.

Payments, OTP registration, identity-document collection, and subscriptions do not simulate successful live transactions. Their screens identify the services that still need connecting. Marketplace listings use sample data. External product image hosts and Google Fonts require internet access; the users hero photo and logo are local assets.

## API foundation

Stack: NestJS, TypeScript, REST, JWT, Argon2, class-validator, Swagger, PostgreSQL/Prisma, Multer, Sharp and Razorpay raw-body HMAC verification. Currency fields in the API/database are **integer paise**; preview UI data uses rupees.

```powershell
Copy-Item backend/.env.example backend/.env
# Configure DATABASE_URL and a strong JWT_SECRET in backend/.env.
npm.cmd run db:generate
npm.cmd run db:push
npm.cmd run db:seed
npm.cmd --prefix backend run build
npm.cmd --prefix backend run start
```

Create a local PostgreSQL database first. The seed inserts categories and plans; it creates an admin only when `ADMIN_EMAIL`, `ADMIN_PHONE`, and a 12+ character `ADMIN_PASSWORD` are supplied. No default admin password exists. Swagger is at http://localhost:4000/api/docs.

Implemented endpoints cover password registration/login, current user, categories/plans, public catalogue, seller profile/product creation, buyer requirements, seller lead marketplace/unlock, admin lead and KYC review, notifications, payment orders/history/webhooks, and private file upload/authorized download. Buyers and sellers cannot self-register as admin. Production login rejects unverified mobile accounts.

Database row locks serialize lead purchases and seller credit deductions. Duplicate seller/lead purchases have a unique constraint. Buyer contact is returned only for purchased leads. Razorpay capture is idempotent; a captured payment that loses the last available lead slot is flagged for manual refund review. KYC documents live outside Nginx’s public media directory and require owner/admin authorization. Image uploads are decoded and converted to WebP; PDFs are served as private attachments.

The frontend currently uses preview storage, **not these API endpoints**. The API is a foundation, not the complete production implementation of all 37 sections. Remaining production work includes frontend API/session integration, provider-backed mobile OTP, SMTP delivery/notification jobs, full subscription lifecycle/history, public media management, protected-deal purchase eligibility and evidence workflows, complete admin CRUD/CMS, invoices/refund processing, and database integration/security tests. Claim forms and reviews currently run in the frontend preview; they have no live claim endpoints. Do not expose the preview admin as a production console.

## Verification

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd test
node users/scripts/verify-ui.mjs
```

Tests exercise five-slot availability, category and duplicate restrictions, inactive leads, and exact-byte webhook signature verification. They do not replace a concurrent PostgreSQL integration test or payment-gateway test environment.

The browser test uses local headless Chrome and requires all three frontends running. Set `CHROME_PATH` for a different installation, and `PREVIEW_URL`, `SELLER_URL`, `ADMIN_URL` for alternate ports. It checks each app's local preview flows: credit unlock/persistence, requirement posting, admin review, seller category matching, saved products and mobile navigation. Desktop/mobile screenshots are saved in each app’s `artifacts/` folder.

## VPS deployment files

`backend/deploy/nginx.conf` includes public media serving, private upload denial, and authentication request limiting. `users/pm2.config.cjs, seller/pm2.config.cjs, admin/pm2.config.cjs and backend/deploy/pm2.config.cjs` runs Next.js and NestJS with PM2. `backend/deploy/backup.sh` dumps PostgreSQL, archives files, and copies backups off-server over SSH. Configure real paths, credentials, HTTPS with Let's Encrypt, backup retention and restore checks. These files have not been applied to a server.

The current Next.js setup follows the [official installation requirements](https://nextjs.org/docs/app/getting-started/installation).

The Docker setup regenerates the cross-platform dependency lockfile with Sharp's Linux binaries and the scoped patched YAML override. The regenerated lockfile audit reports no known vulnerabilities. No remote deployment was performed.
