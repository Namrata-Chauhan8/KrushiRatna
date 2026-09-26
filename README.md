# Krushiratna Admin

A frontend-only admin console for an agricultural marketplace: categories,
subcategories, products and orders. There is no backend — all data lives in the
browser.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Other scripts: `npm run build`, `npm start`,
`npm run lint`.

## How data works

There is no API or database. Every collection is persisted to its own
`localStorage` key and read through a React external store, so edits survive a
refresh, a tab restart and the simulated logout.

| Key                    | Contents      |
| ---------------------- | ------------- |
| `admin_categories`     | Categories    |
| `admin_subcategories`  | Subcategories |
| `admin_products`       | Products      |
| `admin_orders`         | Orders        |

A fifth key, `admin_schema_version`, records which storage migrations have run
(`src/lib/storage.ts`). Saved data is never overwritten by the app's defaults, so
when a dataset is retired a migration is what actually clears it from browsers
that already have it.

Everything ships **empty** — categories, subcategories, products and orders are
all created through the UI. Orders are started from the Product page: each row's
"Add to order" action opens a new order or appends to an open one. An order line
snapshots the product's name, unit and price, so later edits to a product never
rewrite the history of an order that already exists.

Categories are **hidden, never deleted**. Hiding one takes it, its subcategories
and its products out of every page, dropdown and dashboard count, but nothing is
removed from storage — unhiding it on the Category page brings everything back.

**Logout** is simulated and deliberately leaves the data intact. To start over,
clear the four keys above from your browser's devtools.

Stored JSON is shape-checked on read (`src/store/validators.ts`); anything
unusable falls back to the seed and the key is repaired. Uploaded images are
downscaled to a 256px WEBP thumbnail before being stored, to stay inside the
~5MB storage quota — if a write still fails, a banner says so rather than
silently losing the change.

## Layout

```
src/
  app/          routes; each page.tsx is a server component that renders a client view
  components/   layout/ (shell, sidebar) and ui/ (table, modal, form controls, ...)
  hooks/        pagination, storage-error subscription
  lib/          formatting, persistence, image resizing, xlsx writer
  store/        the admin store and its runtime validators
  types/        shared domain types
```

The Orders page exports a real `.xlsx` built in the browser (`src/lib/xlsx.ts`),
written directly as Office Open XML and zipped with `fflate`.
