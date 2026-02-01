# No Free Lunch AI

Split bills with friends, hassle-free. Send a receipt photo to the Telegram bot, get a shareable link, then choose your items and percentages in the web app—no math after dessert.

# About
The project was created specificly for the Cursor AI Hackathon, organised in Hamburg, Germany 31.01.2026-01.02.2026

## What it does

- **Telegram bot**: Users send a photo of a receipt. The bot uses AI to extract line items, stores them in a database, and replies with a link to split the bill.
- **Web app**: Anyone opening the link (in a browser or inside Telegram) sees the receipt items, selects what they’re paying for and the percentage per item, then submits. The bot calculates their total and can send a message (e.g. with payment details like IBAN).

## Project structure

```
NoFreeLunchAI/
├── frontend/          # Next.js app (React 19, Tailwind, Supabase)
│   ├── app/
│   │   ├── page.tsx       # Home: "Ready to split the bill?"
│   │   ├── select/        # Select items & percentages, submit to n8n webhook
│   │   └── items/         # Dev/mock items page
│   └── lib/supabase/      # Supabase client
├── n8n_server/
│   └── NoFreeLunchAI.json # n8n workflow (Telegram, OpenAI, Supabase, webhook)
└── README.md
```

## Prerequisites

- **Node.js** 18+ (for the frontend)
- **Supabase** project (database: `User`, `Receipt`, `Item`, `Receipt_Item`, `User_Item` as used by the workflow)
- **n8n** instance (cloud or self-hosted) to run the workflow
- **Telegram Bot** (BotFather) and **OpenAI** API key for the n8n workflow

## Setup

### 1. Supabase

- Create a Supabase project and tables (or adapt the schema to match what the n8n workflow expects: users by Telegram ID, receipts, items, receipt–item and user–item relations).
- In the Supabase dashboard, get your project URL and the **anon** (public) key.

### 2. n8n workflow

- Open your n8n instance and import `n8n_server/NoFreeLunchAI.json`.
- In n8n, create credentials for:
  - **Telegram** (Bot API token from BotFather)
  - **Supabase** (URL + service or anon key as required by the nodes)
  - **OpenAI** (API key)
- Attach these credentials to the corresponding nodes (replace any placeholder credential IDs).
- Activate the workflow. Note the **webhook URL** for the “split” webhook (the one that receives the POST with `receipt_id`, `telegram_user_id`, `telegram_user_name`, `items`).

### 3. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Point the frontend at your n8n webhook:

- In `frontend/app/select/page.tsx`, set `WEBHOOK_URL` to your n8n webhook URL (the same one you noted in step 2), or move it to an env var like `NEXT_PUBLIC_N8N_WEBHOOK_URL` and use that in the code.

### 4. Run the frontend

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the home page to go to “Let’s split”; the select page needs a `receipt` query (e.g. `?receipt=<receipt_id>`) or to be opened from Telegram with the start parameter so it knows which receipt to load.

## Environment variables

| Variable | Where | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend | Supabase anon/public key |
| n8n webhook URL | Frontend (select page) | URL of the n8n “split” webhook (consider `NEXT_PUBLIC_N8N_WEBHOOK_URL`) |

Credentials for Telegram, Supabase, and OpenAI are configured only inside n8n (not in the repo).

## Tech stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase JS client
- **Automation**: n8n (Telegram trigger, OpenAI for receipt OCR, Supabase nodes, webhook)
- **Data**: Supabase (PostgreSQL)

## License

See repository license file.
