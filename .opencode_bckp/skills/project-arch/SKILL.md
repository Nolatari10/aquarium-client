\---

name: frontend-guardian

description: Skill to improve and maintain the React frontend so that it stays aligned with the backend API, remains performant, and easy to evolve.

\---



\## Skill goal



This skill helps the agent:

\- Understand the structure of the React frontend.

\- Keep the frontend aligned with the backend contracts (endpoints, DTOs, auth, validation).

\- Improve readability, reuse, and performance in React components.

\- Propose safe refactors that preserve behavior and improve UX and DX.



\## Frontend context



The frontend is a React application located under the `frontend/` directory at the project root.  

Adjust these assumptions to your actual setup:



\- Build tool: Vite / CRA / Next.js (adjust as needed).

\- Main entry point: `frontend/src/main.tsx` or `frontend/src/index.tsx`.

\- Typical folders:

&#x20; - `frontend/src/components/`: reusable UI components.

&#x20; - `frontend/src/pages/` or `routes/`: page-level components / routed views.

&#x20; - `frontend/src/hooks/`: custom hooks.

&#x20; - `frontend/src/services/` or `api/`: API client logic and HTTP calls.

&#x20; - `frontend/src/state/`: global state (Redux, Zustand, Context, etc.) if used.



When exploring the frontend, try to map:

\- Which components or pages correspond to which backend endpoints.

\- Where the main data flows come from and how they are managed.



\## React best practices to follow



When proposing changes to the frontend, follow these guidelines:



1\. \*\*Component design\*\*

&#x20;  - Keep components small and focused; avoid “god components”.

&#x20;  - Extract reusable parts into separate components when they are used in multiple places.

&#x20;  - Use props and composition instead of deeply nested conditionals.



2\. \*\*State management\*\*

&#x20;  - Keep local UI state close to where it is used.

&#x20;  - Lift state up only when it truly needs to be shared.

&#x20;  - Avoid unnecessary global state when a simple prop chain is enough.



3\. \*\*Data fetching and backend alignment\*\*

&#x20;  - Centralize API calls in a small number of well-defined modules (for example `services` or `api` directory).

&#x20;  - Keep the frontend types / interfaces in sync with backend DTOs.

&#x20;  - When you change a backend endpoint, update the corresponding frontend service and types, and reflect the change in `project\_Context.md`.



4\. \*\*Performance and UX\*\*

&#x20;  - Avoid unnecessary re-renders (for example, memoize expensive computations or components when needed).

&#x20;  - Handle loading, error, and empty states explicitly.

&#x20;  - Avoid heavy computations in render; move them to hooks or memoized helpers.



5\. \*\*Code quality\*\*

&#x20;  - Use descriptive names for components, hooks, and props.

&#x20;  - Keep JSX clean and readable; extract complex UI sections into smaller components.

&#x20;  - Prefer pure components without side effects inside render.



\## Coordination with the backend



When editing the frontend, always consider how it interacts with the backend:



\- If an API contract changes (URL, payload, response shape, error schema), update:

&#x20; - The frontend service / API client.

&#x20; - Any affected components or hooks.

&#x20; - The relevant sections in `project\_Context.md` (for example, “Endpoints / APIs” or “Frontend”).  



\- When adding new features:

&#x20; - First understand the backend use case and data contracts.

&#x20; - Then design the frontend flow (components, state, data fetching) around those contracts.

&#x20; - Document significant new flows in `project\_Context.md`.



\## Interaction rules for this skill



When this skill is active and you work on frontend tasks:



1\. Start by locating relevant files in `frontend/` using read/glob/grep tools.

2\. Propose changes in terms of:

&#x20;  - Which components will be touched.

&#x20;  - Which backend endpoints they depend on.

&#x20;  - How the change affects UX and performance.

3\. Apply small, incremental refactors rather than large rewrites, unless the user explicitly asks for a bigger redesign.

4\. After major UI or data flow changes, suggest updating `project\_Context.md` to reflect:

&#x20;  - New pages/routes.

&#x20;  - New or changed flows.

&#x20;  - Dependencies on backend endpoints.

