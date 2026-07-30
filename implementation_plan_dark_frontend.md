# Dark Pattern Detector Frontend Implementation Plan

This plan details the implementation of the **Browser Extension (React/MV3)** and the **Web Dashboard (React/Vite/Recharts)** for the Dark Pattern Detector project. Both frontends will be built inside the existing workspace under `extension/` and `dashboard/` to consume a fixed backend API.

## User Review Required

> [!IMPORTANT]
> **Extension Bundling Approach**: We will use Vite to build the extension's popup React app, and a lightweight `esbuild` script to bundle the `background.js` and `content-script.js` files. This prevents Vite's code-splitting from leaking shared chunks into the isolated service worker/content script contexts, ensuring maximum stability.
>
> **Shadow DOM for Overlay**: The `<WarningOverlay />` will be rendered inside a Shadow Root attached to the host page's DOM. This guarantees the overlay is 100% immune to the host website's stylesheets.

## Open Questions

*None at this time. The provided API contract and design patterns are complete and ready for implementation.*

## Proposed Changes

We will build the frontend structure across the two workspace directories: `extension` and `dashboard`.

---

### Component: Browser Extension (`extension/`)

The Chrome Extension will use Manifest V3. The popup will be a React app built using Vite, while the background service worker and content script will be bundled via a custom esbuild command for isolation.

#### [NEW] [manifest.json]
- Configures Manifest V3.
- Requests permissions: `activeTab`, `storage`, `scripting`.
- Registers `background.js` as the background service worker.
- Sets up content scripts for all URLs (`<all_urls>`).
- Defines the `popup/index.html` as the default popup.
- Configures icons.

#### [NEW] [package.json]
- Declares dependencies: `react`, `react-dom`, `lucide-react` (for icons).
- Declares devDependencies: `vite`, `@vitejs/plugin-react`, `esbuild`, `copyfiles`.
- Configures build scripts:
  - `build:popup`: Build popup via Vite.
  - `build:scripts`: Bundle background and content script via esbuild.
  - `build`: Run both builds and copy manifest/icons to the `dist` directory.

#### [NEW] [vite.config.js]
- Standard Vite config for the React popup page.
- Outputs build to `dist/popup` folder or builds into `dist/` directly.

#### [NEW] [index.html]
- Standard HTML entry point for the extension popup.

#### [NEW] [content-script.js]
- Runs in the context of web pages.
- Scrapes text nodes recursively, omitting scripts, styles, and hidden elements.
- Chunks text into distinct snippets (keyed by element selectors/paths).
- Implements a `MutationObserver` with a debounce timer (e.g., 800ms) to detect route changes/DOM changes on SPAs and trigger scanning.
- Sends snippets to `background.js` via `chrome.runtime.sendMessage`.
- Listens for scan results from `background.js`.
- Renders `<WarningOverlay />` nodes using React by attaching a Shadow Root near/over flagged elements.
- Handles disabling scanning if the user toggles the current domain off.

#### [NEW] [background.js]
- Runs as the service worker.
- Listens for messages from `content-script.js` containing site snippets.
- Performs a POST request to `/api/scan` with `{ url, domain, textSnippets }` using standard `fetch` (ensuring compatibility in service workers).
- Relays results and `websiteRiskScore` back to the tab.
- Updates the extension's badge text/color to show the detection count.
- Stores/retrieves per-site enable/disable settings in `chrome.storage.local`.

#### [NEW] [WarningOverlay.jsx]
- React component that displays warning information (pattern type, snippet context, description, confidence).
- Uses inline styling inside the Shadow Root to maintain a premium dark-mode, glassmorphism aesthetic.
- Includes a "Dismiss" button.

#### [NEW] [Popup.jsx]
- Interactive popup that loads when clicking the extension icon.
- Displays:
  - Current tab domain.
  - Scan state (scanning, disabled, loading).
  - Risk summary (risk score, total detections on the page).
  - List of detected patterns on the current page.
  - Enable/disable toggle for the current domain.
  - Button to open the full Web Dashboard.
- Styling: sleek, dark neon design system.

#### [NEW] [Popup.css]
- Sleek styles scoped to the popup's fixed dimensions (360x450px).

---

### Component: Web Dashboard (`dashboard/`)

A Vite-based single-page application for user analytics, charts, and scanning history.

#### [NEW] [package.json]
- Declares dependencies: `react`, `react-dom`, `react-router-dom`, `axios`, `recharts`, `lucide-react`.
- Declares devDependencies: `vite`, `@vitejs/plugin-react`.

#### [NEW] [vite.config.js]
- Configures Vite with React plugin and dev server ports.

#### [NEW] [index.html]
- Main HTML file importing Google Fonts (Outfit, Inter) and mounting the app.

#### [NEW] [client.js]
- Configured Axios instance with `baseURL` read from `import.meta.env.VITE_API_BASE_URL`.
- Sets `withCredentials: true` to handle cookies.
- Request interceptor: attaches `Authorization: Bearer <token>` from AuthContext.
- Response interceptor: handles `401` errors, attempts silent refresh (`POST /api/auth/refresh`), retries once. If refresh fails, triggers logout and routes to `/login`.

#### [NEW] [auth.api.js]
- Exposes `login(email, password)`, `signup(email, password)`, `refresh()`, and `logout()` API functions.

#### [NEW] [dashboard.api.js]
- Exposes `getOverview()`, `getDetections(params)`, `getWebsiteScores(params)`, and `getTrends(range)`.

#### [NEW] [AuthContext.jsx]
- React context managing `{ user, accessToken, loading, login(), signup(), logout(), isAuthenticated }`.
- Attempts a silent session restore (`POST /api/auth/refresh`) on initial mount.

#### [NEW] [RequireAuth.jsx]
- Guard component that checks if user is logged in. Redirects to `/login` if not. Shows a loading spinner while refreshing session.

#### [NEW] [App.jsx]
- Configures React Router routes:
  - `/login`: Unauthenticated signup/login portal.
  - `/overview`: Dashboard home.
  - `/history`: Paginated table of detections.
  - `/website-scores`: Risk leaderboard.
- Wraps appropriate components in `<RequireAuth>` and the entire tree in `<AuthContext.Provider>`.

#### [NEW] [Navbar.jsx]
- Top menu bar showing app logo, main routes (Overview, History, Risk Scores), logged-in user email, and logout button. Styled with a frosted-glass effect.

#### [NEW] [TrendsLineChart.jsx]
- Renders an interactive Recharts line chart showing daily detection trends. Handles generic data structures.

#### [NEW] [PatternTypeBarChart.jsx]
- Renders a horizontal bar chart displaying detections by dark pattern categories.

#### [NEW] [Login.jsx]
- Multi-mode sign-in / sign-up screen. Premium styling with smooth transitions, animated background elements, and full validation.

#### [NEW] [Overview.jsx]
- Displays dashboard summary: metric cards, recent scan feeds, and charts (trends and breakdown).

#### [NEW] [History.jsx]
- Advanced filterable table with search by domain, filter by pattern type, date picker, and pagination.
- Syncs state to URL query parameters via `useSearchParams` for shareable pages.

#### [NEW] [WebsiteRiskScores.jsx]
- Lists scanned domains along with their risk scores, number of scans, and detection counts. Allows sorting by score/scans.

#### [NEW] [index.css]
- Central design system stylesheet. Declares CSS variables for a dark-mode neon theme, glassmorphism utilities, scrollbars, and buttons.

---

## Verification Plan

### Automated Tests
- Since there is no automated test runner configured in the base, we will write our code in a highly modular and type-safe fashion.
- We will verify that both workspaces compile successfully without compilation errors by executing:
  - `pnpm build` in the workspace root.

### Manual Verification
- Deploying the extension:
  1. Inspect the compiled output in `extension/dist`.
  2. Verify that `manifest.json`, popup HTML, compiled scripts (`background.js`, `content.js`), and assets are properly placed.
- Mock API Verification:
  - Verify that the Axios instance client intercepts and retries on `401` using a mock setup.
  - Verify that the extension communication loop (`content-script` -> `background` -> mock REST -> `content-script` -> Shadow DOM) works.
