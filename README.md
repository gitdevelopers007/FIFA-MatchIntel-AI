# FIFA MatchIntel AI

FIFA MatchIntel AI is a generative AI stadium intelligence platform for FIFA World Cup 2026 smart stadium operations. It combines role-based dashboards, live operational data, and a context-aware AI copilot for fans, volunteers, security teams, medical staff, and tournament organizers.

## Challenge Fit

Selected vertical: Smart Stadiums and Tournament Operations.

The platform supports the full match-day flow:
- Fans: gate queues, seat guidance, food wait times, transport updates, accessibility locations, and multilingual AI assistance.
- Volunteers: operational checklists, incident reporting, crowd guidance, and task status updates.
- Security: incident triage, gate congestion monitoring, crowd risk awareness, and dispatch support.
- Medical: AED and first-aid routing, emergency incident visibility, and responder decision support.
- Organizers: occupancy metrics, sustainability scores, transport status, disruption simulation, and live control-room updates.

## Key Features

- Role-based dashboards for fan, volunteer, security, medical, and operations personas.
- AI copilot backed by current stadium data from SQLite, with Gemini support when `GEMINI_API_KEY` is configured.
- Local fallback AI engine for reliable demos without external API access.
- Live operations control room for gates, concessions, transport routes, match status, and incidents.
- Interactive stadium map and role-aware operational context.
- Accessibility-focused UI controls with labels, ARIA state, keyboard-friendly persona selection, and high-contrast theme support.
- Security hardening through bounded request validation, bearer session checks for chat and mutation routes, and restricted CORS origins.
- Deploy-ready FastAPI and Vite build path with synced source and deploy backend modules.

## Architecture

```text
FIFA MatchIntel AI/
  backend/
    app/
      api/          FastAPI routes and session guard
      core/         settings, database, CORS configuration
      models/       SQLAlchemy ORM models
      schemas/      Pydantic validation schemas
      services/     stadium data access and AI response logic
    tests/          unittest coverage for auth and AI fallback
  frontend/
    src/
      components/   design system, chat assistant, interactive map
      contexts/     app state provider and useApp hook
      pages/        persona dashboards and landing page
      services/     Axios API client and local demo fallback
  deploy/           deploy-oriented backend/static layout
```

## AI Pipeline

1. The user sends a question with role, language, seat, and gate context.
2. The backend classifies intent into emergency, navigation, transport, food, crowd, operations, or general.
3. The data service injects current stadium facts: gates, stalls, medical stations, incidents, transport, and accessibility locations.
4. Gemini returns structured JSON when configured.
5. If Gemini is unavailable, a deterministic local engine returns fact-aware responses for reliable demos.

## Security Improvements

- CORS is controlled through `BACKEND_CORS_ORIGINS`; wildcard origins are not used in source or deploy entrypoints.
- Chat and write endpoints require a bearer session token.
- Session tokens are deterministic SHA-256 session identifiers for demo use, not plain mock username strings.
- Pydantic schemas bound chat payload size, incident text, statuses, wait times, and sustainability scores.
- Endpoint 404 errors are preserved instead of being converted to generic 500 responses.
- Environment secrets stay in `.env`; `.env.example` contains only safe placeholders.

## Accessibility Improvements

- Inputs are connected to labels with stable IDs.
- Validation errors use `role="alert"` and `aria-invalid`.
- Icon-only buttons include accessible labels.
- Theme controls expose pressed state.
- Persona selection uses radio-group semantics and keyboard-focusable buttons.
- Loading indicators expose status labels.
- Visible copy avoids mojibake and markdown symbols inside rendered UI.

## Quality Checks

Run backend tests:

```bash
python -m unittest discover -s backend/tests
```

Compile backend source:

```bash
python -m compileall backend/app deploy/backend
```

Run frontend lint:

```bash
cd frontend
npm run lint
```

Build frontend:

```bash
cd frontend
npm run build
```

Current local validation status:

```text
Backend tests: 9 tests passing
Backend compile: passing
Frontend lint: passing with zero warnings
Frontend build: passing
```

## Local Setup

Prerequisites:
- Python 3.10+
- Node.js 18+
- npm

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Configure environment:

```bash
copy .env.example .env
```

Run the unified development launcher:

```bash
python run.py
```

Open:
- Frontend: `http://localhost:5173`
- API docs: `http://localhost:8000/docs`

## Demo Access Codes

- Fan: `TKT-2026-9041`
- Volunteer: `VOL-7704`
- Security: `SEC-4512`
- Medical: `MED-8092`
- Organizer: `OPS-1234`

## Deployment Notes

Render deployment uses `render.yaml`.

Docker/Hugging Face style deployment can use the root `Dockerfile`, which builds the Vite frontend, copies static assets, seeds the database, and serves FastAPI on port `7860`.

Set production CORS explicitly:

```env
BACKEND_CORS_ORIGINS=https://your-frontend-domain.example
```

Optional Gemini support:

```env
GEMINI_API_KEY=your_key_here
```
