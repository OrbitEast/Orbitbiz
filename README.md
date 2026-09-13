# OrbitBiz

**OrbitBiz** is a connected business management workspace by **Orbit East**, designed to bring day-to-day business operations into one practical system.

> **Business, connected.**

OrbitBiz is being built around a simple idea: business data should not live in disconnected screens. A customer, sale, invoice, payment, purchase, supplier, stock movement and financial record should remain connected so that one action can continue naturally into the next.

## Product status

🚧 **Pre-launch / active development**

The core application foundation is in place and the product is now moving through final refinement before broader feature expansion.

Current priorities are:

- reliable end-to-end workflows
- correct calculations and business-state transitions
- connected data between modules
- secure business-scoped access
- responsive workspace behaviour
- consistent UI and navigation
- production bug fixing and QA

The product is not being presented as a demo. Features are being built against real application data and real database workflows.

---

## Product flow

OrbitBiz is designed as a connected operating flow rather than a collection of isolated tools.

### Customer side

```text
Customer
   ↓
Quotation
   ↓
Sale / Invoice
   ↓
Payment / Receipt
   ↓
Customer history
   ↓
Reports & insights
```

### Procurement side

```text
Supplier
   ↓
Purchase Order
   ↓
Purchase
   ↓
Warehouse / Stock
   ↓
Supplier Payment
   ↓
Finance
```

### Operational loop

```text
Business
  ├── Customers
  ├── Sales
  ├── Purchases
  ├── Inventory
  ├── Finance
  ├── CRM
  └── Reports
        ↕
   Shared business data
```

The goal is that information entered once can be reused wherever it is logically required, reducing duplicate entry and disconnected records.

---

## Current workspace

The application currently has foundations and working workflows across:

- 🏢 Business setup and settings
- 👥 Customers and customer profiles
- 🤝 CRM activities and follow-ups
- 📦 Products and inventory
- 🏭 Warehouses and stock locations
- 🧾 Invoices and invoice items
- 💳 Payments and customer receipts
- 🛒 Purchases
- 📋 Purchase orders
- 🧑‍💼 Vendors / suppliers
- 💸 Supplier payments
- 📝 Quotations
- 💰 Expenses and finance foundations
- 🔄 Reconciliation workflows
- 📊 Reports and business summaries

The workspace is designed around real records, business-level access and connected operations rather than placeholder demo content.

---

## Connected data model

OrbitBiz uses relational business data so modules can pass information to one another.

Examples:

- A **customer** can be used while creating a quotation or invoice.
- An **accepted quotation** can continue into an invoice.
- An **invoice** can receive customer payments and receipts.
- A **purchase order** can become a received purchase and update stock.
- A **supplier** can be connected to purchases and supplier payments.
- A **product** can participate in sales, purchases and stock movements.
- A **warehouse** can represent where inventory is held.
- Financial and reconciliation records can reference the underlying business activity.

The application also uses transactional database operations where multiple related records must change together, helping prevent partially completed business actions.

---

## Technology

OrbitBiz currently uses:

- **Frontend:** HTML, CSS and JavaScript
- **Application architecture:** modular client-side workspace with core, domain, data, service and UI layers
- **Database:** PostgreSQL through Supabase
- **Authentication:** Supabase Auth
- **Hosting / deployment:** Firebase Hosting
- **Source control:** GitHub

The current architecture keeps the business database and relational workflows in Supabase while using Firebase Hosting for production web delivery.

---

## Architecture

```text
OrbitBiz
│
├── app/
│   ├── core/
│   │   ├── auth.js
│   │   ├── bootstrap.js
│   │   ├── config.js
│   │   ├── events.js
│   │   ├── permissions.js
│   │   ├── store.js
│   │   └── validate.js
│   │
│   ├── domain/
│   │   ├── models.js
│   │   ├── money.js
│   │   └── transactions.js
│   │
│   ├── data/
│   │   └── repository.js
│   │
│   ├── services/
│   │   └── transaction-engine.js
│   │
│   └── ui/
│       ├── app.js
│       ├── landing.js
│       ├── onboarding.js
│       └── workspace/
│
├── assets/
├── index.html
├── supabase-schema.sql
└── README.md
```

The architecture is intentionally separated so UI improvements can happen without breaking the underlying business, security and transaction layers.

---

## Design direction

OrbitBiz is being developed as professional business software rather than a generic dashboard template.

### Visual principles

- Clean and structured workspace
- Existing OrbitBiz visual identity and colour system
- Strong typography and readable information hierarchy
- Compact but comfortable business tables and forms
- Clear primary actions
- Responsive desktop and mobile layouts
- Consistent record, list and detail experiences
- Minimal visual noise
- No unnecessary decorative UI that interferes with work

### Product principles

**Connected** — modules should understand related business records.

**Accurate** — totals, taxes, payments, stock and status transitions must remain consistent.

**Fast** — frequent actions should require as little navigation as possible.

**Reliable** — important multi-step operations should be validated and handled transactionally.

**Secure** — users should only access data belonging to businesses they are authorized to access.

**Responsive** — the same workspace should remain usable across desktop, tablet and mobile.

**Practical** — features should solve real business workflows instead of existing only for demonstration.

---

## Database and security

Supabase PostgreSQL is the business data source of truth.

The database includes business-scoped records for areas such as:

- businesses and memberships
- customers
- vendors
- items
- invoices and invoice items
- payments
- purchases and purchase items
- quotations and quotation items
- stock movements
- warehouses and warehouse stock
- purchase orders
- receipts
- vendor payments
- CRM activities
- payment accounts
- journal and reconciliation records
- audit-oriented records

Row-level access controls and business membership checks are part of the data-access model.

Critical workflows use database-side validation where appropriate, including invoice status transitions, customer receipt recording and purchase-order receiving.

---

## Current development phase

### Phase 1 — Foundation

- [x] Core application architecture
- [x] Supabase integration
- [x] Authentication foundation
- [x] Google sign-in
- [x] Business onboarding
- [x] Business-scoped data access
- [x] Core domain/data layers
- [x] Transaction and validation foundations

### Phase 2 — Core business workspace

- [x] Dashboard foundation
- [x] Customer management
- [x] Customer profiles
- [x] Inventory foundation
- [x] Invoices
- [x] Purchases
- [x] Expenses / finance foundation
- [x] Quotations
- [x] Vendors / suppliers
- [x] Purchase orders
- [x] Warehouses
- [x] Customer receipts
- [x] Supplier payments
- [x] CRM activities
- [x] Reconciliation foundation
- [x] Connected database workflows

### Phase 3 — Final refinement and production readiness

- [x] SPA navigation and browser history handling
- [x] Cross-module data-flow review
- [x] Database relationship integrity checks
- [x] Transactional workflow refinement
- [x] RLS / business-access review
- [x] Calculation and status-transition review
- [x] Responsive UI refinement
- [ ] Full production QA across every workspace flow
- [ ] Final accessibility pass
- [ ] Performance optimisation
- [ ] Error-state and empty-state refinement
- [ ] Launch readiness review

### Phase 4 — Business intelligence and automation

Planned after the core product is stable:

- [ ] Advanced reports
- [ ] Business dashboards and KPIs
- [ ] Cash-flow visibility
- [ ] Profit and margin analysis
- [ ] Inventory alerts
- [ ] Low-stock and reorder workflows
- [ ] Automated business summaries
- [ ] Intelligent operational insights
- [ ] Workflow recommendations
- [ ] Scheduled reports and notifications

### Phase 5 — Expansion

Longer-term product areas may include:

- [ ] Advanced GST workflows
- [ ] More complete accounting capabilities
- [ ] Multi-warehouse operations
- [ ] Staff and role management improvements
- [ ] Advanced CRM pipelines
- [ ] Supplier procurement tools
- [ ] Business document generation
- [ ] Import/export utilities
- [ ] Integrations with external business services
- [ ] Mobile-focused improvements

Future features will be added only when they can connect cleanly to the existing business data model.

---

## Quality standard

Before a workflow is considered production-ready, it should satisfy the following:

1. The UI action works from the correct screen.
2. Required data is validated before submission.
3. The correct business is used for every database operation.
4. Related records are created or updated consistently.
5. Calculations are correct and rounded appropriately.
6. Status transitions follow valid business rules.
7. Failures do not silently create partial records.
8. The resulting data appears correctly in the next connected workflow.
9. Browser navigation does not unexpectedly lose the workspace state.
10. Desktop and mobile layouts remain usable.

---

## Development rules

When extending OrbitBiz:

- Preserve the existing business data model unless a schema change is genuinely required.
- Prefer reusable services and domain logic over duplicated calculations.
- Keep database operations business-scoped.
- Use transactional RPCs for operations that modify multiple related records.
- Do not introduce fake/demo business records into production workflows.
- Avoid duplicate view implementations and script-order collisions.
- Preserve the established visual identity when adding new modules.
- Treat authentication, RLS, database integrity and transaction logic as production-critical code.

---

## Deployment

The application is deployed through Firebase Hosting from the GitHub repository.

Production URL:

**https://orbitbiz.web.app/**

Source repository:

**https://github.com/OrbitEast/Orbitbiz**

---

## Brand

**Orbit East** is the technology brand behind OrbitBiz.

**OrbitBiz — Business, connected.**
