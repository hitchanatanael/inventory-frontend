# Project Tree

Generated folders are included but not expanded.

```text
inventory-frontend/
|-- .agents/
|   Local agent metadata folder. It is present but currently empty.
|
|-- .git/
|   Git repository metadata, not application source.
|
|-- dist/
|   Generated Vite build output, not source.
|
|-- node_modules/
|   Installed npm dependencies, not source.
|
|-- public/
|   Static assets served directly by Vite.
|   |
|   `-- images/
|       Images referenced by HTML and React components.
|       |
|       |-- mandiri-tani-logo.png
|       |   Logo used by the favicon, sidebar, and mobile header.
|       |
|       `-- user/
|           Header user avatar assets.
|           |
|           `-- natanael.jpeg
|               Avatar used by `UserDropdown`.
|
|-- src/
|   React application source.
|   |
|   |-- App.jsx
|   |   Defines all routes and renders them inside `AppLayout`.
|   |
|   |-- main.jsx
|   |   Mounts React and composes `ThemeProvider` and `AppWrapper`.
|   |
|   |-- index.css
|   |   Imports Tailwind CSS and defines theme tokens, base styles, and menu/form utilities.
|   |
|   |-- components/
|   |   Reusable UI and shared components.
|   |   |
|   |   |-- common/
|   |   |   Cross-page helpers.
|   |   |   |
|   |   |   |-- PageBreadCrumb.jsx
|   |   |   |   Breadcrumb link to Home plus current page title.
|   |   |   |
|   |   |   |-- PageMeta.jsx
|   |   |   |   Page title/meta description helpers and Helmet provider wrapper.
|   |   |   |
|   |   |   |-- ScrollToTop.jsx
|   |   |   |   Scrolls the window to the top after route changes.
|   |   |   |
|   |   |   `-- ThemeToggleButton.jsx
|   |   |       Toggles the light/dark theme context.
|   |   |
|   |   |-- form/
|   |   |   Form primitives.
|   |   |   |
|   |   |   |-- Label.jsx
|   |   |   |   Shared form label.
|   |   |   |
|   |   |   `-- input/
|   |   |       Input components.
|   |   |       |
|   |   |       `-- InputField.jsx
|   |   |           Controlled input with hint, error, success, disabled, and read-only styles.
|   |   |
|   |   |-- header/
|   |   |   Header-related components.
|   |   |   |
|   |   |   |-- Header.jsx
|   |   |   |   Alternate header component not imported by `AppLayout`.
|   |   |   |
|   |   |   `-- UserDropdown.jsx
|   |   |       Static user dropdown used by `AppHeader`.
|   |   |
|   |   `-- ui/
|   |       Low-level UI primitives.
|   |       |
|   |       |-- badge/
|   |       |   |
|   |       |   `-- Badge.jsx
|   |       |       Colored status pill.
|   |       |
|   |       |-- button/
|   |       |   |
|   |       |   `-- Button.jsx
|   |       |       Primary/outline button with optional icons.
|   |       |
|   |       |-- dropdown/
|   |       |   |
|   |       |   `-- Dropdown.jsx
|   |       |       Dropdown container with outside-click closing.
|   |       |
|   |       |-- modal/
|   |       |   |
|   |       |   `-- index.jsx
|   |       |       Modal overlay with close controls, Escape handling, and scroll lock.
|   |       |
|   |       `-- table/
|   |           |
|   |           `-- index.jsx
|   |               Lightweight table element wrappers.
|   |
|   |-- context/
|   |   React contexts for global UI state.
|   |   |
|   |   |-- SidebarContext.jsx
|   |   |   Sidebar expanded, mobile, hover, active item, and submenu state.
|   |   |
|   |   `-- ThemeContext.jsx
|   |       Light/dark mode state persisted to `localStorage`.
|   |
|   |-- layout/
|   |   Active application shell.
|   |   |
|   |   |-- AppHeader.jsx
|   |   |   Sticky header with sidebar toggles, theme toggle, and user dropdown.
|   |   |
|   |   |-- AppLayout.jsx
|   |   |   Wraps routed pages with sidebar, backdrop, header, and outlet.
|   |   |
|   |   |-- AppSidebar.jsx
|   |   |   Branding and navigation menu definitions.
|   |   |
|   |   `-- Backdrop.jsx
|   |       Mobile sidebar backdrop.
|   |
|   `-- pages/
|       Route-level pages.
|       |
|       |-- Dashboard/
|       |   |
|       |   `-- Home.jsx
|       |       Static dashboard cards and stock preview table.
|       |
|       |-- Inventory/
|       |   |
|       |   |-- InventoryPlaceholder.jsx
|       |   |   Shared placeholder for unfinished routes.
|       |   |
|       |   `-- StokBarang.jsx
|       |       Read-only stock view with local data, location tabs, summaries, search, and pagination.
|       |
|       |-- MasterData/
|       |   |
|       |   |-- MasterAnggota.jsx
|       |   |   Local member CRUD page.
|       |   |
|       |   |-- MasterAnggotaModals.jsx
|       |   |   Member add/edit/delete modals.
|       |   |
|       |   |-- MasterBarang.jsx
|       |   |   Local item CRUD page.
|       |   |
|       |   `-- MasterBarangModals.jsx
|       |       Item add/edit/delete modals.
|       |
|       `-- Transactions/
|           |
|           |-- BarangMasuk.jsx
|           |   Local incoming transaction CRUD page with payment/status calculations.
|           |
|           |-- BarangMasukModals.jsx
|           |   Incoming transaction add/edit/delete modals.
|           |
|           |-- BarangKeluar.jsx
|           |   Local outgoing transaction CRUD page with payment/status/margin calculations.
|           |
|           `-- BarangKeluarModals.jsx
|               Outgoing transaction add/edit/delete modals.
|
|-- tools/
|   Tooling folder. It is present but currently empty.
|
|-- .gitignore
|   Git ignore rules.
|
|-- eslint.config.js
|   ESLint flat config.
|
|-- index.html
|   Vite HTML shell and favicon declaration.
|
|-- package-lock.json
|   Locked npm dependency tree.
|
|-- package.json
|   npm scripts and dependency declarations.
|
|-- postcss.config.js
|   PostCSS config for Tailwind CSS.
|
`-- vite.config.js
    Vite config using the React plugin.
```

## Architecture Notes

- The repository is frontend-only.
- There are no API service files, backend files, or database files.
- Current feature data is local to page components.
- `dist/` and `node_modules/` are generated or installed artifacts.
