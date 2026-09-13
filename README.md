# OrbitBiz

### Business, connected.

**OrbitBiz** is a web-based business management workspace by **Orbit East**. It brings customers, CRM, sales, invoicing, purchasing, inventory, payments, finance and reporting into one connected operating system.

> **One business workspace. Connected records. Clearer operations.**

**Live product:** https://orbitbiz.web.app/  
**Repository:** https://github.com/OrbitEast/Orbitbiz  
**Product status:** Pre-launch · Active development

---

## Overview

Small and growing businesses often operate across disconnected spreadsheets, billing tools, stock records, payment notes and customer lists. OrbitBiz is being engineered around a different model: **the business record should travel with the workflow.**

A customer can lead to a quotation. A quotation can become an invoice. An invoice can receive a payment and receipt. A purchase order can become a received purchase and update inventory. Supplier activity can continue into finance.

The objective is not to build a collection of isolated screens. It is to build a **connected business workspace** where related records remain understandable from one workflow to the next.

---

## Product surface

| Area | Purpose |
| --- | --- |
| **Dashboard** | High-level view of business activity and attention areas |
| **Customers** | Customer records, profiles and transaction context |
| **CRM** | Activities, follow-ups and customer relationship context |
| **Sales** | Quotations, sales flow and invoice creation |
| **Invoicing** | Invoices, line items, payment state and customer history |
| **Payments & Receipts** | Customer payment recording and receipt workflows |
| **Inventory** | Products, stock movements and inventory visibility |
| **Warehouses** | Inventory locations and warehouse stock |
| **Purchases** | Purchasing records and supplier activity |
| **Purchase Orders** | Structured procurement and receiving workflows |
| **Suppliers** | Vendor records and supplier relationships |
| **Supplier Payments** | Payments connected to supplier activity |
| **Finance** | Expenses, payments and financial workflow foundations |
| **Reconciliation** | Comparison and resolution of financial differences |
| **Reports** | Business activity and operational summaries |
| **Business Settings** | Business profile, configuration and workspace settings |

---

## Connected workflows

### Sales → payment

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
Reports
```

### Procurement → inventory

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

### The operating model

```text
                    ┌───────────────┐
                    │    Business   │
                    └───────┬───────┘
                            │
       ┌──────────┬─────────┼─────────┬──────────┐
       ↓          ↓         ↓         ↓          ↓
   Customers    Sales    Purchases  Inventory  Finance
       │          │         │         │          │
       └──────────┴─────────┼─────────┴──────────┘
                            ↓
                         Reports
```

The central principle is simple: **enter information once where possible, then reuse it through the connected workflow.**

---

## Current capabilities

The current application includes real application workflows backed by a relational database rather than static demo screens.

### Business operations

- Business onboarding and settings
- Business-scoped records and access
- Customer management and profiles
- CRM activities and follow-ups
- Product and inventory management
- Warehouse records and stock locations
- Quotations and quotation items
- Invoices and invoice items
- Customer payments and receipts
- Purchases and purchase items
- Purchase orders and receiving
- Vendors and suppliers
- Supplier payments
- Expenses and finance foundations
- Reconciliation workflows
- Business reports and summaries

### Workflow integrity

Important multi-record operations are designed to remain consistent across related tables. Examples include:

- quotation → invoice conversion
- invoice status transitions
- customer receipt recording
- purchase-order receiving
- stock movement creation
- warehouse stock updates
- supplier payment relationships

Database-side validation is used where an operation needs multiple related changes to succeed together.

---

## Architecture

OrbitBiz uses a modular client-side application structure with business logic and data-access responsibilities separated from the presentation layer.

```text
OrbitBiz/
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
├── public/
│   ├── about/
│   ├── contact/
│   ├── features/
│   ├── resources/
│   ├── security/
│   ├── privacy/
│   └── terms/
│
├── index.html
├── firebase.json
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── supabase-schema.sql
└── README.md
```

The separation is intentional: UI work should not require rewriting transaction rules, data access or security boundaries.

---

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| Application architecture | Modular client-side architecture |
| Database | PostgreSQL via Supabase |
| Authentication | Supabase Auth |
| Hosting | Firebase Hosting |
| Source control | GitHub |
| Deployment | GitHub Actions → Firebase Hosting |

The production application uses Supabase as the business-data and authentication platform while Firebase Hosting delivers the web application.

---

## Data model

The database is designed around business-scoped relational records. Core entities include:

- businesses and memberships
- customers
- vendors
- items
- invoices and invoice items
- invoice payments
- payments and payment accounts
- purchases and purchase items
- quotations and quotation items
- stock movements
- warehouses and warehouse stock
- purchase orders and purchase-order items
- receipts and receipt items
- vendor payments
- CRM activities
- journal and reconciliation records
- audit-oriented records

Relationships are designed so downstream workflows can reference the original business activity rather than creating disconnected duplicates.

---

## Security model

Security is treated as a product requirement, not a final checklist item.

Current foundations include:

- authenticated application access
- business membership checks
- business-scoped database operations
- PostgreSQL Row Level Security policies
- authenticated-only execution for critical application RPCs
- database-side validation for critical workflows
- relational integrity and foreign-key constraints
- validation of important state transitions

The application has also undergone database integrity checks covering key relationship chains and orphan-record scenarios.

> Security configuration should continue to be reviewed as the product expands. The repository does not claim that the application is independently audited or certified.

---

## Public product site

OrbitBiz has a separate public information layer alongside the authenticated workspace. This keeps the product interface focused while giving visitors and search engines crawlable, human-readable pages.

### Public sections

- **About** — OrbitBiz and Orbit East
- **Features** — product capabilities and individual feature areas
- **Resources** — practical guides, glossary and business questions
- **Security** — application security and access principles
- **Contact** — public product and company information
- **Privacy** — privacy policy area
- **Terms** — terms area

The public pages use clean URLs and are included in the public sitemap. Authenticated workspace routes are intentionally kept outside the public sitemap.

### Search visibility

The public site includes:

- descriptive page titles and meta descriptions
- canonical URLs
- crawlable internal links
- `robots.txt`
- an XML sitemap
- Open Graph metadata where appropriate
- structured data on key public pages
- dedicated public pages for product categories and useful business concepts

This is intended to help search engines understand the product and its public content. **Search ranking and indexing are controlled by search engines and cannot be guaranteed by the repository.**

---

## Product principles

### Connected

Business records should carry context from one workflow into the next.

### Accurate

Totals, taxes, payments, inventory quantities and status changes must follow defined business rules.

### Reliable

Multi-step operations should fail safely rather than silently creating partial business records.

### Secure

Users should only access data belonging to businesses they are authorized to access.

### Fast

Frequent business actions should require minimal unnecessary navigation or duplicate entry.

### Responsive

The workspace should remain usable across desktop, tablet and mobile screens.

### Practical

Features should solve real operational problems instead of existing only as demonstrations.

---

## Design direction

OrbitBiz is being developed as professional business software with a distinctive product identity rather than a generic admin template.

The interface direction prioritizes:

- strong information hierarchy
- clear primary actions
- compact but readable business tables
- comfortable forms and record views
- consistent navigation
- responsive layouts
- purposeful colour and visual hierarchy
- minimal decorative noise
- fast access to frequently used operations

The public site and authenticated workspace share the OrbitBiz identity while serving different purposes: **public pages explain the product; the workspace runs the business.**

---

## Development roadmap

### Phase 1 — Foundation · substantially complete

- [x] Core application architecture
- [x] Supabase integration
- [x] Authentication foundation
- [x] Google sign-in
- [x] Business onboarding
- [x] Business-scoped data access
- [x] Core domain and data layers
- [x] Validation and transaction foundations

### Phase 2 — Core business workspace · substantially complete

- [x] Dashboard foundation
- [x] Customers and customer profiles
- [x] CRM activities
- [x] Inventory
- [x] Warehouses
- [x] Invoices
- [x] Customer receipts
- [x] Purchases
- [x] Purchase orders
- [x] Vendors / suppliers
- [x] Supplier payments
- [x] Quotations
- [x] Finance / expenses foundation
- [x] Reconciliation foundation
- [x] Connected database workflows

### Phase 3 — Production readiness · in progress

- [x] SPA navigation and browser history handling
- [x] Clean workspace URLs
- [x] Cross-module data-flow review
- [x] Database relationship integrity review
- [x] Transactional workflow refinement
- [x] RLS / business-access review
- [x] Calculation and status-transition review
- [x] Responsive UI refinement
- [x] Public product information architecture
- [ ] Full end-to-end QA across every workspace flow
- [ ] Accessibility review
- [ ] Performance optimisation
- [ ] Error and empty-state refinement
- [ ] Launch-readiness review

### Phase 4 — Intelligence & automation · planned

- [ ] Advanced reporting
- [ ] Business dashboards and KPIs
- [ ] Cash-flow visibility
- [ ] Profit and margin analysis
- [ ] Inventory alerts
- [ ] Low-stock and reorder workflows
- [ ] Automated business summaries
- [ ] Operational insights
- [ ] Workflow recommendations
- [ ] Scheduled reports and notifications

### Phase 5 — Platform expansion · planned

- [ ] Advanced GST workflows
- [ ] More complete accounting capabilities
- [ ] Multi-warehouse operations
- [ ] Expanded staff and role management
- [ ] Advanced CRM pipelines
- [ ] Procurement tooling
- [ ] Business document generation
- [ ] Import / export utilities
- [ ] External integrations
- [ ] Mobile-focused improvements

The roadmap is intentionally progressive: new capabilities should extend the existing business model instead of creating parallel disconnected systems.

---

## Engineering quality bar

A workflow is not considered production-ready merely because the button works.

Before shipping a business workflow, OrbitBiz aims to verify that:

1. The action is available from the correct context.
2. Required input is validated before submission.
3. The operation is scoped to the correct business.
4. Related records are linked correctly.
5. Monetary and quantity calculations are deterministic.
6. Status transitions follow valid business rules.
7. Multi-record changes are handled safely.
8. Errors are visible instead of silently swallowed.
9. The resulting record is available to the next connected workflow.
10. Browser navigation preserves application context.
11. The experience remains usable on smaller screens.
12. The workflow does not introduce unnecessary duplicate state.

---

## Development guidelines

When extending the project:

- Preserve the existing business data model unless a schema change is genuinely required.
- Prefer reusable domain logic and services over duplicated calculations.
- Keep database operations business-scoped.
- Use transactional database functions when multiple related records must change together.
- Keep authentication and authorization boundaries explicit.
- Do not introduce fake customer, financial or inventory data into production workflows.
- Avoid duplicate view implementations and script-order collisions.
- Preserve the established OrbitBiz visual language.
- Treat database integrity, RLS, authentication and transaction logic as production-critical.
- Keep public SEO content useful and people-first rather than creating thin keyword pages.

---

## Deployment

The production site is deployed through GitHub Actions to Firebase Hosting.

**Production:** https://orbitbiz.web.app/  
**Source:** https://github.com/OrbitEast/Orbitbiz

The repository is the source of truth for application code, public product pages and deployment configuration.

---

## Documentation & contribution direction

The repository is currently maintained as an actively developed product rather than a general-purpose framework. As the public launch matures, documentation can expand into dedicated architecture, contribution, security-reporting and development guides.

For now, the most important principle is simple:

> **Build the connected system first. Add complexity only when it creates measurable business value.**

---

## Orbit East

**Orbit East** is the technology brand behind OrbitBiz.

**OrbitBiz — Business, connected.**

---

## License

No open-source license has been declared for this repository at this stage. Unless a license is added, the repository should not be assumed to grant permission to reuse, modify or redistribute the code.
