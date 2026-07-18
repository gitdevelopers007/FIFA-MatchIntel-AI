# FIFA MatchIntel AI - FIFA World Cup 2026 Smart Stadiums

FIFA MatchIntel AI is a production-grade Generative AI-powered Stadium Intelligence Platform designed to elevate stadium operations and the overall tournament experience for fans, organizers, volunteers, and emergency venue staff during the FIFA World Cup 2026.

The project is built using **Clean Architecture** principles to separate concerns between the UI Presentation layer, Local database query services, and the Generative AI inference pipeline.

---

## 🏟️ Chosen Vertical & Persona Logic

We chose the **Smart Stadiums & Tournament Operations** vertical. The platform provides customized dashboards and AI copilots customized to the active user's role:
1. **Fans & International Tourists**: Access gate security check-in queues, seating paths, food stall wait times with sustainability indices, transit planners, and a Lost & Found alert desk.
2. **Volunteers**: Track assigned operational tasks, check off completed guidelines, and log real-time stadium incidents.
3. **Security & Medical Dispatch Teams**: Review dispatcher logs, dispatch response personnel to incidents, locate medical hubs/AED safety machines, and view active SVG crowd heatmaps.
4. **Operations & Tournament Managers**: Monitor global occupancy, average queue metrics, active safety alarms, sustainability scores, and trigger real-time disruption simulations to test emergency response workflows.

---

## 🛠️ Tech Stack & Architecture

### Frontend (Presentation Layer)
- **React 19 & TypeScript**: Component modularity and strict type safety.
- **Vite**: Ultra-fast bundler and development server.
- **Tailwind CSS v4**: Theme styling, glassmorphism panel backings, and neon-pulse micro-animations.
- **Lucide Icons**: Premium iconography.

### Backend (Business Logic & Data Layer)
- **Python 3.14 / FastAPI**: REST API handling request validation and unified JSON formatting.
- **SQLite & SQLAlchemy ORM**: Relational schema supporting easy migration to PostgreSQL.
- **Google GenAI SDK**: Orchestrates intent categorization, safety checks, and prompt assembly.

---

## 🧠 Context-Aware AI Pipeline

To prevent sending raw user input directly to the LLM, the platform implements a safety context enrichment pipeline:
1. **User Request**: Collects input message, user role context, active language, and seat section.
2. **Intent Parsing**: Categorizes intent into `emergency`, `navigation`, `transport`, `food`, `crowd`, or `operations`.
3. **Context Enrichment**: Directly queries the SQLite database for current facts (e.g. "Gate C is congested", "Express Train leaves in 6 mins").
4. **LLM Assembly & Validation**: Populates a role-based system template with stadium facts, sends it to Gemini (via `gemini-2.5-flash`), and validates the JSON response.
5. **Fallback Simulation**: If no `GEMINI_API_KEY` is provided, a local matching rules engine parses the keywords against current database facts to produce high-fidelity, context-aware responses.

---

## 📂 Project Structure

```
FIFA MatchIntel AI/
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI REST endpoints
│   │   ├── core/            # Settings, DB config, CORS middlewares
│   │   ├── models/          # SQLAlchemy Database Models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # AI Service, local DB services
│   │   └── main.py          # FastAPI startup entry point
│   ├── requirements.txt     # Backend python dependencies
│   └── seed_db.py           # Database bootstrap & mock seeder
├── frontend/
│   ├── src/
│   │   ├── components/      # DesignSystem items, SVG InteractiveMap, ChatAssistant
│   │   ├── contexts/        # AppContext (Role, Language, Themes, Toasts)
│   │   ├── pages/           # LandingPage, FanDashboard, Volunteer, Operations
│   │   ├── services/        # Axios API Client
│   │   ├── styles/          # Tailwind CSS configuration
│   │   └── main.tsx         # React DOM mount point
│   ├── package.json
│   └── vite.config.ts
├── run.py                   # Development server launcher
├── .env.example             # Secret config template
└── .gitignore               # Keeps repo size < 10 MB by ignoring builds/node_modules
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### Setup & Run
1. Clone the repository and navigate to the project directory:
   ```bash
   cd "FIFA MatchIntel AI"
   ```
2. Set up virtual environment and install backend requirements:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```
3. Install frontend node packages:
   ```bash
   cd frontend
   npm install --registry=http://registry.npmjs.org/
   cd ..
   ```
4. Copy the environment template and add your optional Gemini API Key:
   ```bash
   copy .env.example .env
   ```
5. Run the unified launcher script:
   ```bash
   python run.py
   ```
6. Open your browser:
   - **Frontend Console**: http://localhost:5173
   - **FastAPI API Swagger Docs**: http://localhost:8000/docs
