# PR Review Bot

An AI-powered code reviewer that analyzes GitHub PR diffs for accessibility (WCAG 2.2) and performance issues, displaying findings inline — just like a real GitHub code review.

## Features

- Paste any unified diff and get structured findings with severity ratings
- Inline annotations pinned to the exact line in the diff
- WCAG 2.2 criterion references on accessibility findings
- Streaming responses — findings appear as Claude identifies them
- Demo mode — no API key required to see it in action
- Download review as Markdown
- Dark/light theme toggle
- Exemplary accessibility (skip link, ARIA live regions, semantic markup)

## Tech Stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS v4
- Anthropic SDK (claude-sonnet-4-6, streaming)
- parse-diff

## Getting Started

```bash
cp .env.local.example .env.local
# add your ANTHROPIC_API_KEY to .env.local

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo mode works without an API key — click **Try Demo** on the homepage.
