# LingoCoon

LingoCoon is an early-stage personalized language-learning application built around contextual practice, learner feedback, and progress over time.

The current public prototype includes flashcard study, multilingual onboarding, AI-assisted practice, dictionary lookup, speech input, text-to-speech, authentication, and spaced-repetition foundations. The product is undergoing a structured rebuild; the current prototype should not be treated as the final learning experience.

## Live application

[lingocoon.vercel.app](https://lingocoon.vercel.app)

## Technology

| Area | Technology |
| --- | --- |
| Application | Next.js 16 with App Router |
| Interface | React 19, Tailwind CSS, Radix UI |
| Language | TypeScript in strict mode |
| Authentication and data | Supabase |
| Validation | Zod |
| Internationalization | i18next |
| Deployment | Vercel |

## Local development

Requirements:

- Node.js 20.9 or later; CI uses Node.js 24;
- npm;
- a local environment file based on `.env.local.example`.

```bash
npm ci
cp .env.local.example .env.local
npm run dev
```

The local application is available at `http://localhost:3000` by default.

## Verification

Run the complete local verification pipeline with:

```bash
npm run check
```

The pipeline scans the current tree for credential patterns, runs ESLint, checks TypeScript, and creates a production build. GitHub Actions runs the same checks for pull requests and updates to `main`.

## Repository structure

```text
.github/workflows/  Continuous integration
public/locales/     Translation resources
scripts/            Repository maintenance and security scripts
src/app/            Next.js routes and server endpoints
src/components/     Shared and domain-oriented interface components
src/hooks/          Client-side reusable behavior
src/lib/            Application, server, data, and integration logic
src/types/          Shared TypeScript contracts
```

## Security

Never commit `.env.local`, provider credentials, downloaded service-account files, or production data. Use `.env.local.example` only as a variable-name template and run `npm run security:secrets` before publishing changes.
