# Authion

An open-source, local-first alternative to Notion and AppFlowy crafted for writers, researchers, and creators—built with Next.js, React, TipTap, Tailwind CSS, and Zustand.

## Features

- **Local-First Storage**: Pages, Kanban boards, databases, theme preferences, and AI settings are persisted in your browser's `localStorage` via Zustand.
- **Three Page Views**:
  - **Document View**: Rich-text editor powered by TipTap with slash commands (`/`), headings, task lists, code blocks, images, and Markdown export (`.md`).
  - **Kanban View**: Drag-and-drop task boards powered by `@hello-pangea/dnd` with columns, assignees, labels, statuses, and dates.
  - **Grid View**: Structured database tables supporting `text`, `number`, `status`, `date`, `select`, `multi-select`, and `checkbox` columns.
- **Templates & Nested Pages**: Organize pages hierarchically in the sidebar and start quickly from built-in templates.
- **Compressed URL Sharing**: Share any page as a URL-encoded compressed snapshot (`?share=...`) using `lz-string`—no backend database required.
- **Multi-Provider AI Integration**: Connect to **Google Gemini**, **OpenAI**, **OpenRouter**, or a **local LLM** (e.g., Ollama at `http://localhost:11434`).
- **Light & Dark Mode**: Toggleable theme persisted locally.

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, `lucide-react` icons
- **State Management**: Zustand (`persist` middleware)
- **Rich Text Editor**: TipTap v3
- **Drag & Drop**: `@hello-pangea/dnd`
- **AI SDK**: `@google/genai` (server-side route `/api/ai`) + direct browser fetch for local LLMs

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/theglassdesk/Authion.git
cd Authion
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` (or `.env`) and add any API keys you plan to use server-side:

```bash
cp .env.example .env.local
```

```env
# Required for server-side Google Gemini API calls
GEMINI_API_KEY="your_gemini_api_key"

# Optional: OpenRouter / OpenAI keys (can also be entered in the UI AI Settings modal)
OPENROUTER_API_KEY=""
OPENAI_API_KEY=""

# Optional: App URL (used as HTTP-Referer for OpenRouter requests)
APP_URL="http://localhost:3000"
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production application |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint (`eslint .`) |
| `npm run clean` | Clean Next.js build cache (`next clean`) |

## AI Configuration

Open **AI Settings** in the app to choose your provider and test the connection:

- **Google (Gemini)**: Uses `GEMINI_API_KEY` from your server environment (`gemini-2.5-flash`, `gemini-2.5-pro`).
- **OpenAI**: Uses your API key from the UI or `OPENAI_API_KEY` (`gpt-4o-mini`, `gpt-4o`, `gpt-4-turbo`).
- **OpenRouter**: Uses your API key from the UI or `OPENROUTER_API_KEY` (`anthropic/claude-3.5-sonnet`, `openai/gpt-4o`, `meta-llama/llama-3.1-70b-instruct`, `deepseek/deepseek-r1`).
- **Local (Ollama)**: Connects directly from your browser to your local endpoint (default `http://localhost:11434`). If using Ollama, start it with `OLLAMA_ORIGINS=*` so the browser can reach it.

## Project Structure

```text
.
├── app/
│   ├── api/ai/route.ts        # Server-side AI proxy for Gemini, OpenAI, and OpenRouter
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Main workspace shell & ?share= URL importer
├── components/
│   ├── Sidebar.tsx            # Page tree navigation & creation
│   ├── TopBar.tsx             # Page actions, theme toggle, sharing, AI tools
│   ├── modals/
│   │   ├── AISettingsModal.tsx
│   │   └── TemplatesModal.tsx
│   └── views/
│       ├── DocumentView.tsx   # TipTap rich-text editor
│       ├── KanbanView.tsx     # Drag-and-drop Kanban board
│       └── GridView.tsx       # Table/database view
└── lib/
    ├── store.ts               # Zustand store with localStorage persistence
    ├── types.ts               # Page, Kanban, Grid, and AI TypeScript types
    └── utils.ts
```
