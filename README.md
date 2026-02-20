# Quizle

An AI-powered quiz generator that creates custom multiple-choice quizzes from any facts or information you provide. Built with React, Supabase and the Groq API (Llama 3.3 70B).

**[Live Demo](https://newtonr7.github.io/Quizle.7)**

## Features

- **AI Quiz Generation** — Paste in facts or study notes and get a tailored multiple-choice quiz instantly
- **Smart Feedback** — See correct/incorrect answers with a 1.5-second delay before auto-advancing
- **User Authentication** — Sign up and sign in with Supabase Auth to save your quizzes
- **Score Tracking** — Quiz attempts and scores are saved automatically for authenticated users
- **Dark Theme** — Modern dark UI with glassmorphism effects and smooth animations
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Mock Data Fallback** — App remains functional even without an API key (uses sample questions)

## Tech Stack

- **React 19** — UI framework with hooks-based state management
- **React Router** — Client-side routing with HashRouter for GitHub Pages compatibility
- **Groq API** — AI-powered quiz question generation (Llama 3.3 70B)
- **Supabase** — Authentication and PostgreSQL database for quiz/score persistence
- **CSS** — Custom styling with CSS variables, animations, and responsive design

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project ([Create one here](https://supabase.com))

### Installation

```bash
git clone https://github.com/newtonr7/Quizle.7.git
cd Quizle.7
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run

```bash
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Supabase Setup

Create the following tables in your Supabase project:

### `quizzes` table

```sql
CREATE TABLE quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own quizzes"
  ON quizzes FOR ALL
  USING (auth.uid() = user_id);
```

### `attempts` table

```sql
CREATE TABLE attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  quiz_id UUID REFERENCES quizzes(id) NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own attempts"
  ON attempts FOR ALL
  USING (auth.uid() = user_id);
```

## Deployment

The app auto-deploys to GitHub Pages on push to `main` via GitHub Actions.

To deploy manually:

```bash
npm run deploy
```

You'll need to add these secrets in your GitHub repo settings (Settings → Secrets → Actions):

- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

The Groq API key is stored as a Supabase Edge Function secret (`GROQ_API_KEY`) — it never reaches the browser.

## Development Notes

Some things I learned and decisions I made while building this project:

- Used mock quiz data during development to avoid burning API tokens — this made iteration much faster and let me focus on building the UI without worrying about rate limits. I still managed to burn through them though!

- Originally used Gemini 2.0 Flash for quiz generation, but switched to Groq (Llama 3.3 70B) after Google removed free tier access for the Gemini API. Groq's free tier is generous and Llama 3.3 70B handles quiz generation just as well.

- Implemented nested try-catch in the quiz generation service because LLM responses can be unpredictable — the outer catch handles API failures while the inner catch handles JSON parsing errors, both falling back to mock data so the app never crashes.

- React StrictMode helped catch issues early in development by flagging potential problems like side effects in render and patterns.

- Added a 1.5-second feedback delay on quiz answers to give users time to see if they got it right before auto-advancing. Without the delay, the transition felt too abrupt.

- The restart quiz function was tricky at first — the fix ended up being simple: just pass the existing `quizData` back through the same `onQuizGenerated` callback instead of trying to manage a separate restart flow.

- Used `try-catch` with `finally` to always reset the loading state in the quiz generation form. This ensures the button re-enables even if something goes wrong, which is important for a good user experience.

- Understanding async/await for the API calls was a key learning moment — wrapping the API call in an async function and properly awaiting the response before processing it. This took alot of review and tutorial help to understand what I needed to incorperate and why it is important.

- Refactored from manual `currentPage` state to React Router to support browser back/forward navigation and direct URL access. Chose HashRouter because GitHub Pages doesn't support server-side rewrites for client-side routing.

## Update — Switched from Gemini to Groq

As of February 2026, Google removed free tier access for the Gemini API (all models return `limit: 0` on free tier quotas). Since this project relies on free API access, I switched the quiz generation backend from Google Gemini 2.0 Flash to Groq running Llama 3.3 70B. Groq offers a generous free tier (30 requests/min) and the quiz quality is just as good. No new packages were needed — the service now uses `fetch` directly against Groq's OpenAI-compatible REST API instead of the `@google/generative-ai` SDK.

## Author

Roger Newton
