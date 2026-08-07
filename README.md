# 🌲 KotiScout — AI Assisted Finnish Property Finder & Market Intelligence

**KotiScout** is a Finnish real-estate search, automated monitoring, comparison, and property intelligence web application.

Rather than being just a static listing portal, KotiScout acts as a personal **Property Intelligence Assistant** for the Finnish housing market. It allows buyers and investors to track active listings, monitor price reductions, calculate personalized match scores (0–100), compare properties side-by-side, and automate market scans on scheduled intervals.

---

## 🏛 Architecture Diagram

```text
                    ┌─────────────────────────┐
                    │    React Client (Vite)  │
                    │    Nordic Minimal UI    │
                    └────────────┬────────────┘
                                 │ HTTP / REST
                                 ▼
                    ┌─────────────────────────┐
                    │   Fastify API Server    │
                    │   Zod Input Validation  │
                    └────────────┬────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           │                     │                     │
           ▼                     ▼                     ▼
    Search Service         Saved Searches        Notifications
           │                     │                     │
           ▼                     │                     │
   PropertyProvider              │                     │
     (Abstraction)               │                     │
     ┌─────┴───────────────┐     │                     │
     │                     │     │                     │
     ▼                     ▼     │                     │
MockProvider        Authorized   │                     │
(40+ Finnish listings) Provider  │                     │
                                 │                     │
                     Scheduler Service                 │
                                 │                     │
                                 ▼                     ▼
                        Search Run Pipeline ──► In-App Alerts
                                 │
                                 ▼
                        Property Diff Engine
                        (Price / State Diffs)
                                 │
                                 ▼
                        Database (Drizzle ORM)
                        (PostgreSQL / Supabase)
```

---

## ✨ Key Features

- **Automated Market Monitoring**: Save custom search queries that run automatically on schedule (e.g., 08:00, 14:00, 20:00 `Europe/Helsinki`).
- **Instant "Run Now" Manual Scan**: Trigger real-time search runs with immediate scan feedback ("3 new properties found, 2 price drops detected").
- **Property Diff Engine**: Automatically detects:
  - `NEW_PROPERTY`: Newly listed Finnish apartments and houses.
  - `PRICE_DECREASED`: Price reduction amounts and percentages (e.g., `-€16,000 / -6.8%`).
  - `PRICE_INCREASED`, `PROPERTY_REMOVED`, `PROPERTY_RETURNED`, `SCORE_THRESHOLD_REACHED`.
  - Prevents duplicate events.
- **AI Match Scoring Engine (0–100)**: Modular scoring with custom criteria weights:
  - Price vs. budget limit (25 pts)
  - Location & prime district (20 pts)
  - Living area & layout (15 pts)
  - Building age & historic value (10 pts)
  - Monthly maintenance fee / *hoitovastike* (10 pts)
  - Asking price per m² vs district median benchmark (10 pts)
  - Amenities: Balcony (*parveke*), Sauna (*oma sauna*), Elevator (*hissi*) (10 pts)
- **Deal Finder Module**: Evaluates asking €/m² against Finnish district median price benchmarks (e.g., Kallio, Kamppi, Töölö, Matinkylä, Tapiola, Pyynikki) and labels them as market indicators.
- **Price History & Snapshots**: Visual step-by-step history of price reductions with percentage savings.
- **Side-by-Side Property Comparison Matrix**: Compare 2 to 4 properties simultaneously with favorable values highlighted gently.
- **Favorites & Personal Notes**: Save prospective properties and keep private notes (renovation checks, broker notes, viewing observations).
- **In-App Notification Center**: Unread count badges and alerts for price drops and high-score matches.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Monorepo** | npm workspaces, TypeScript 5.7, Vitest |
| **Frontend** | React 18, Vite, Tailwind CSS (Nordic tokens), Lucide icons, React Router, TanStack Query, React Hook Form, Zod |
| **Backend API** | Node.js, Fastify, Zod, @fastify/cors, @fastify/sensible |
| **Property Engine** | PropertyScoringEngine, PropertyDiffEngine, PropertyMatchingEngine, DealFinderEngine, SmartTagsEngine |
| **Database & ORM** | PostgreSQL / Supabase, Drizzle ORM |
| **Scheduling** | SearchScheduler abstraction, Supabase Cron & GitHub Actions compatible endpoint |

---

## 📦 Monorepo Structure

```text
koti-scout/
├── apps/
│   ├── web/                     # React + Vite + Tailwind frontend application
│   │   ├── src/
│   │   │   ├── components/      # UI component library (shadcn style, modals, badges, navbar)
│   │   │   ├── features/        # search, properties, saved-searches, favorites, compare, dashboard
│   │   │   ├── lib/             # API client, EUR formatters, utils
│   │   │   └── App.tsx          # Main application & routing
│   └── api/                     # Fastify Node.js server
│       ├── src/
│       │   ├── routes/          # REST endpoints for search, saved searches, runs, favs, notifs
│       │   ├── services/        # SearchService, SchedulerService, NotificationService
│       │   ├── providers/       # PropertyProvider interface, MockPropertyProvider, AuthorizedProvider
│       │   └── server.ts        # Fastify server entry point
├── packages/
│   ├── shared/                  # Shared Zod schemas, TypeScript types, Finnish geo constants
│   ├── property-engine/         # Modular scoring (0-100), Diff engine, Deal finder, Smart tags
│   └── database/                # Drizzle schema, DB client, 40+ Finnish demo properties & snapshots
├── .github/workflows/
│   ├── ci.yml                   # Lint, Typecheck, Test, Build
│   └── property-search-cron.example.yml
└── package.json                 # Workspaces root configuration
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Node.js 18+ or 22+
- npm 9+

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Environment
Starts both the Fastify API (port 3000) and the React Vite web app (port 5173):
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`

---

## 🧪 Development Commands

```bash
# Run unit test suite (Vitest)
npm run test

# Typecheck all workspaces
npm run typecheck

# Build production bundles
npm run build

# Database operations
npm run db:seed
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `PORT` | Server | Fastify API port (default: `3000`) |
| `DATABASE_URL` | Server | PostgreSQL / Supabase connection string |
| `SUPABASE_URL` | Server | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase Service Role Key (**NEVER expose to browser**) |
| `CRON_SECRET` | Server | Secret bearer token protecting `POST /internal/jobs/run-scheduled-searches` |
| `VITE_API_URL` | Client Safe | Base API endpoint for the web client |
| `DEFAULT_TIMEZONE` | Server/Client | Default scheduler timezone (`Europe/Helsinki`) |
| `DEFAULT_CURRENCY` | Server/Client | Default currency (`EUR`) |

---

## 🔌 How to Implement Another PropertyProvider

KotiScout is decoupled from external sources via the central `PropertyProvider` interface:

```ts
export interface PropertyProvider {
  name: string;

  search(
    filters: PropertyFilters
  ): Promise<PropertySearchResult>;

  getProperty(
    externalId: string
  ): Promise<Property | null>;
}
```

To connect a new authorized data feed:
1. Create a class implementing `PropertyProvider` in `apps/api/src/providers/your-provider.ts`.
2. Map foreign listing attributes to the normalized `Property` model.
3. Register the provider in `PropertySearchService` (`apps/api/src/services/search.service.ts`).
4. The frontend and all scheduler, scoring, and diff mechanisms will work automatically with zero changes.

---

## 🔍 Current Data Source

The current MVP application uses **`MockPropertyProvider`** with 44 synthetic Finnish properties modelled against real market averages across:
- **Helsinki**: Kallio, Kamppi, Töölö, Lauttasaari, Punavuori, Pasila, Kruununhaka, Kalasatama, Jätkäsaari, Haaga, Vuosaari
- **Espoo**: Matinkylä, Tapiola, Leppävaara, Haukilahti, Otaniemi
- **Vantaa**: Tikkurila, Myyrmäki, Kivistö, Korso
- **Tampere**: Keskusta, Pyynikki, Tammela, Hervanta, Kaleva
- **Turku**: Keskusta, Port Arthur, Kupittaa, Runosmäki

A visible **`DEMO DATA`** indicator is displayed in the application header to avoid confusion.

When connecting an authorized real estate portal, open MLS feed, or verified partner API, implement the `PropertyProvider` interface in `apps/api/src/providers/authorized-provider.ts`. The frontend and all scoring/diff pipelines will function seamlessly without any changes.

---

## 🧪 Runtime Verification

The application has been verified through a full runtime and integration QA pass:

1. **API & Server Health**: Fastify backend responds on `http://localhost:3000/health` with proper CORS, error serialization, and Zod query coercion.
2. **Frontend Communication**: React Vite app communicates with backend via `/api` proxy and React Query.
3. **Filter Pipeline**: Filtering by City, District, Max Price, Living Area (m²), Rooms (1–5+), Property Type, Maintenance Fee, and Amenities executes on the backend and updates the UI.
4. **Saved Searches & Live "Run Now"**: Saved search creation, persistence, edit, delete, and manual execution ("Search complete. 3 new properties found, 2 price drops detected") tested and functional.
5. **Diff Engine & Price Reductions**: `PRICE_DECREASED` correctly computes absolute difference and percentage (e.g. `-€20,000 / -8.03%`) without duplicate events.
6. **Price History Snapshots**: Step-by-step price reduction history (e.g. `249,000 € -> 235,000 € -> 219,000 € -> 199,000 €`) renders in the property modal.
7. **Property Comparison Matrix**: Supports 2 to 4 properties with favorable metric highlights and clear limit enforcement.
8. **In-App Notifications**: Real-time unread bell badge, notification dropdown, and mark-as-read interactions.
9. **Protected Cron Endpoint**: `POST /internal/jobs/run-scheduled-searches` rejects unauthorized calls without `CRON_SECRET` with 401, and executes due searches when authorized.
10. **Development Simulator Page (`/dev`)**: Interactive testing triggers for price drops, new listings, and scheduler cron runs.
11. **Responsive Testing**: Verified layout behavior at 375px (mobile drawer filters, single column cards), 768px, and 1440px.

---

## 🛡️ Security & Ethical Principles

- **No Unauthorized Scraping**: KotiScout does **NOT** implement anti-bot circumvention, CAPTCHA bypass, IP spoofing, or prohibited rate-limit evasion.
- **Extensible Architecture**: Built on clean provider adapters and official authorized data interfaces.
- **Server-Side Protection**: All secrets (`CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) remain strictly on the backend.
- **Row Level Security (RLS)**: Users only access their own saved searches, favorites, notifications, and preferences.
