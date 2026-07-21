# Project Context

## Overview

This repository is a frontend-only Vite React application for **Mandiri Tani Sejahtera**. The visible product context is fertilizer inventory for **KSP CU Mutiara Mandiri**, based on page titles, sidebar labels, and UI copy in the source.

Implemented screens cover:

- Dashboard inventory summary.
- Master Anggota.
- Master Barang.
- Barang Masuk.
- Barang Keluar.
- Stok Barang.
- Placeholder pages for Biaya Keluar, Loan Anggota, and Laporan Keuangan.

The app currently uses page-local mock data. There is no backend, database, API client, or persistence layer in this repository.

## Tech Stack

- React `^19.0.0`.
- Vite `^6.1.0`.
- React Router `^7.1.5`.
- Tailwind CSS `^4.0.8` through PostCSS.
- lucide-react `^1.24.0`.
- react-helmet-async `^2.0.5`.
- clsx `^2.1.1`.
- tailwind-merge `^3.0.1`.
- ESLint `^9.19.0` with React, React Hooks, and React Refresh plugins.

## Runtime Flow

1. `index.html` provides the `#root` element and loads `/src/main.jsx`.
2. `src/main.jsx` renders React in `StrictMode`.
3. `ThemeProvider` initializes light/dark mode from `localStorage`.
4. `AppWrapper` provides `react-helmet-async` context.
5. `src/App.jsx` defines routes with `BrowserRouter`, `Routes`, and `Route`.
6. `AppLayout` renders the sidebar, mobile backdrop, header, and routed page outlet.
7. Each page owns its own mock data, form state, filtering, pagination, validation, and calculations.

## Development Status

### Frontend

- [x] Vite React shell.
- [x] Tailwind theme and global CSS utilities.
- [x] Sidebar/header layout.
- [x] Theme toggle.
- [x] Dashboard.
- [x] Master Anggota local CRUD.
- [x] Master Barang local CRUD.
- [x] Barang Masuk local CRUD and calculations.
- [x] Barang Keluar local CRUD and calculations.
- [x] Stok Barang read-only view.
- [x] Placeholder routes for Biaya Keluar, Loan Anggota, and Laporan Keuangan.
- [ ] API integration.
- [ ] Persistent storage.
- [ ] Authentication flow.

### Backend and Database

- [ ] Backend application.
- [ ] API routes.
- [ ] Controllers/services/validators/middleware.
- [ ] Database schema/models/migrations.

No backend or database files exist in the current repository.

## Folder Architecture

- `public/`: Static assets served by Vite.
- `public/images/`: App logo and user avatar images.
- `src/`: React application source.
- `src/components/common/`: Shared helpers for metadata, breadcrumbs, scroll reset, and theme toggle.
- `src/components/form/`: Reusable form label and input components.
- `src/components/header/`: Header-related components. `UserDropdown.jsx` is used by `AppHeader`; `Header.jsx` exists but is not imported by the active layout.
- `src/components/ui/`: Reusable UI primitives: badge, button, dropdown, modal, and table wrappers.
- `src/context/`: React context providers for theme and sidebar state.
- `src/layout/`: App shell components used around every route.
- `src/pages/Dashboard/`: Dashboard page.
- `src/pages/Inventory/`: Stock page and generic placeholder page.
- `src/pages/MasterData/`: Master Anggota and Master Barang pages and modals.
- `src/pages/Transactions/`: Barang Masuk and Barang Keluar pages and modals.
- `dist/`: Generated Vite build output.
- `node_modules/`: Installed npm dependencies.

## Routes

| URL | Component | Purpose |
| --- | --- | --- |
| `/` | `Home` | Dashboard summary and stock preview. |
| `/master-anggota` | `MasterAnggota` | Local member master data management. |
| `/master-barang` | `MasterBarang` | Local item master data management. |
| `/barang-masuk` | `BarangMasuk` | Local incoming inventory transaction management. |
| `/barang-keluar` | `BarangKeluar` | Local outgoing inventory transaction management. |
| `/stok` | `StokBarang` | Read-only stock monitoring by location. |
| `/biaya-keluar` | `InventoryPlaceholder` | Placeholder page. |
| `/loan-anggota` | `InventoryPlaceholder` | Placeholder page. |
| `/laporan-keuangan` | `InventoryPlaceholder` | Placeholder page. |
| `*` | `Home` | Fallback route. |

## Implemented Features

### Dashboard

- File: `src/pages/Dashboard/Home.jsx`.
- Uses static `summaryCards` and `stockRows`.
- Shows Barang Masuk, Barang Keluar, Transaksi Bulan Ini, and a stock preview table.
- Uses `PageMeta`, `Badge`, table primitives, and lucide icons.

### Master Anggota

- Files: `MasterAnggota.jsx`, `MasterAnggotaModals.jsx`.
- Local data fields: `id`, `nomor_anggota`, `nama_anggota`, `keterangan`.
- Supports search, entries-per-page, pagination, add, edit, delete, modal validation, and toast messages.
- Validation: member number and name are required; member number must be unique in the current local array; `keterangan` is always `ANGGOTA`.

### Master Barang

- Files: `MasterBarang.jsx`, `MasterBarangModals.jsx`.
- Local data fields: `id`, `kode_barang`, `nama_barang`, `satuan`, `harga_satuan`.
- Supports search, entries-per-page, pagination, add, edit, delete, modal validation, Rupiah display, and toast messages.
- Validation: item code, name, unit, and unit price are required; unit price must be greater than 0; item code must be unique case-insensitively in the current local array.

### Barang Masuk

- Files: `BarangMasuk.jsx`, `BarangMasukModals.jsx`.
- Local entities: hard-coded items, locations, and transactions.
- Supports status filter, location filter, search, entries-per-page, pagination, add, edit, delete, modal validation, calculated totals, and toast messages.
- Transaction fields include date, item, location, quantity, payment, modal price, arrival status, remaining payment, and status.
- Status rules:
  - `LOAN` when `barang_sampai` is not `SUDAH`.
  - `LUNAS` when goods arrived and payment is at least total.
  - `PIUTANG` when goods arrived and payment is below total.
- Calculation rules:
  - Total is `jumlah * harga_modal`.
  - Remaining payment is `Math.max(total - jumlah_bayar, 0)`.

### Barang Keluar

- Files: `BarangKeluar.jsx`, `BarangKeluarModals.jsx`.
- Local entities: hard-coded members, items, locations, and transactions.
- Supports status filter, location filter, search, entries-per-page, pagination, add, edit, delete, modal validation, calculated totals, margin, and toast messages.
- Transaction fields include date, member, item, location, quantity, sale price, modal price, payment, remaining payment, margin, and status.
- Status rules:
  - `LUNAS` when payment is at least total.
  - `BELUM LUNAS` when payment is above 0 and below total.
  - `BELUM BAYAR` when payment is 0.
- Calculation rules:
  - Total is `jumlah * harga_jual`.
  - Remaining payment is `Math.max(total - jumlah_bayar, 0)`.
  - Margin is `(harga_jual - harga_modal) * jumlah`.

### Stok Barang

- File: `src/pages/Inventory/StokBarang.jsx`.
- Local data fields: `id`, `id_master_barang`, `kode_barang`, `nama_barang`, `satuan`, `id_lokasi`, `nama_lokasi`, `stok`, `harga_satuan`.
- Computed fields: `nilai_aset`, `status_stok`.
- Supports location switching between `Pusat` and `Suban`, search, entries-per-page, pagination, summary cards, and stock status badges.
- Stock status rules:
  - `HABIS` when stock is 0 or below.
  - `MENIPIS` when stock is 1 through 20.
  - `AMAN` when stock is above 20.
- Asset value is `stok * harga_satuan`.

### Placeholder Pages

- File: `src/pages/Inventory/InventoryPlaceholder.jsx`.
- Used by `/biaya-keluar`, `/loan-anggota`, and `/laporan-keuangan`.
- Renders metadata, breadcrumb, title, and description only.

## Reusable Components

| Component | File | Purpose | Main Props |
| --- | --- | --- | --- |
| `Button` | `src/components/ui/button/Button.jsx` | Primary/outline button with icon support. | `children`, `size`, `variant`, `startIcon`, `endIcon`, `onClick`, `type`, `className`, `disabled` |
| `Badge` | `src/components/ui/badge/Badge.jsx` | Status pill with color and variant options. | `variant`, `color`, `size`, `startIcon`, `endIcon`, `children` |
| `Modal` | `src/components/ui/modal/index.jsx` | Overlay modal with close button, Escape handling, backdrop click, and scroll lock. | `isOpen`, `onClose`, `children`, `className`, `showCloseButton`, `isFullscreen` |
| Table primitives | `src/components/ui/table/index.jsx` | Light wrappers for table elements. | `children`, `className`, `isHeader` for `TableCell` |
| `Input` | `src/components/form/input/InputField.jsx` | Controlled input with error/success/hint states. | `type`, `id`, `name`, `placeholder`, `value`, `onChange`, `onClick`, `onFocus`, `min`, `max`, `step`, `inputMode`, `readOnly`, `disabled`, `success`, `error`, `hint` |
| `Label` | `src/components/form/Label.jsx` | Shared form label. | `htmlFor`, `children`, `className` |
| `PageMeta` | `src/components/common/PageMeta.jsx` | Sets document title and description. | `title`, `description` |
| `AppWrapper` | `src/components/common/PageMeta.jsx` | Provides Helmet context. | `children` |
| `PageBreadcrumb` | `src/components/common/PageBreadCrumb.jsx` | Breadcrumb back to Home. | `pageTitle` |
| `ThemeToggleButton` | `src/components/common/ThemeToggleButton.jsx` | Toggles theme context. | none |
| `ScrollToTop` | `src/components/common/ScrollToTop.jsx` | Scrolls to top on route change. | none |
| `Dropdown` | `src/components/ui/dropdown/Dropdown.jsx` | Dropdown container with outside-click close. | `isOpen`, `onClose`, `children`, `className` |
| `UserDropdown` | `src/components/header/UserDropdown.jsx` | Static user menu. | none |

## API, Backend, and Database

No API layer exists.

- No `axios` dependency or import.
- No `fetch` calls.
- No service folder.
- No environment variable usage found.
- No backend source files.
- No database schema, models, migrations, seed files, or database client.

All current application data is declared in frontend page files as local arrays.

## Coding Patterns

- Function components with React hooks.
- Page-local `useState` for data, forms, modals, pagination, filters, errors, and toasts.
- `useMemo` for derived lists, pagination slices, summaries, and calculations.
- Controlled form fields.
- `modalMode` values such as `add`, `edit`, and `delete`.
- Field-level validation through an `errors` object.
- Toast state cleared with `window.setTimeout(..., 2500)`.
- Search through lowercase concatenated row fields.
- Rupiah formatting through `Intl.NumberFormat("id-ID")`.
- Transaction dates formatted through `Intl.DateTimeFormat("id-ID")`.
- Styling through Tailwind utility classes and custom tokens in `src/index.css`.

## Environment Variables

None are referenced in the current source.

## Known Repository Facts and Gaps

- Data resets on reload because it is page-local state.
- Master data, transaction data, and stock data are duplicated across page files.
- Barang Masuk and Barang Keluar do not update `StokBarang`.
- Dashboard data is static.
- `BarangKeluar` can calculate `BELUM BAYAR`, but the status filter only lists `LUNAS` and `BELUM LUNAS`.
- `src/components/header/Header.jsx` exists but is not used by `AppLayout`.
- No tests are present.
- The user identity in the header is static.
