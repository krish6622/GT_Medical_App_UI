# GT Medical Solutions — Frontend (Web UI)

B2B Wholesale Medical Ordering Platform. **React 18 + Vite 5 + TypeScript + Tailwind CSS**.
Medical-blue / white / green enterprise theme, mobile-first responsive, RBAC-aware navigation.

## Prerequisites
- Node **18.17+** recommended (works on 18.14 with Vite 5; upgrade to 20 LTS for newer tooling).
- The backend running on `http://127.0.0.1:8920` (see `GT_Medical_App_Backend`).

## Quick start
```bash
npm install
npm run dev        # http://localhost:5174  (proxies /api → :8920)
```
Production:
```bash
npm run build      # type-checks + bundles into dist/
npm run preview
```

### Demo logins
| Role | Email | Password | Sees |
|---|---|---|---|
| Super Admin | `admin@gtmedical.com` | `Admin@12345` | Admin dashboard, customers, inventory, reports, audit, settings |
| Pharmacy Owner | `owner@citycare.com` | `Pharmacy@123` | Customer dashboard, catalogue, cart, orders, invoices |

## What's implemented
- **Auth**: login, pharmacy self-registration, JWT in localStorage with silent refresh-token rotation, protected routes.
- **Dashboards**: admin (sales trend + top-customers charts, KPI cards) and customer (credit/outstanding/deliveries).
- **Catalogue**: searchable product grid with live stock; add-to-cart for pharmacy users.
- **Cart → Order**: quantity edit, order summary, place order.
- **Orders**: list + detail with the full lifecycle (approve / reject / pack / dispatch / deliver / cancel) gated by RBAC permissions, plus invoice generation.
- **Invoices**: list + GST PDF download.
- **Customers** (staff): approval workflow, credit-limit management, status filter.
- **Inventory / Payments / Reports / Audit / Settings**: staff surfaces with CSV export.

## Config
`VITE_API_BASE` (in `.env`) overrides the API origin. In dev it's blank and Vite proxies `/api`.

## Architecture
```
src/
  lib/      api (axios + refresh interceptor), auth context (useAuth/useCan), useFetch, types, format
  components/ Layout (RBAC sidebar), ProtectedRoute, ui primitives (StatCard, Badge, Async, ...)
  pages/    Login, Register, Dashboard, Catalogue, Cart, Orders, OrderDetail,
            Invoices, Customers, Inventory, Payments, Reports, Audit, Settings
```
RBAC: the sidebar and privileged actions are gated by `useCan(permission)`, mirroring the
backend permission matrix — non-admins never see admin controls.
