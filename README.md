# Shop Inventory and Sales Management

Full-stack inventory, purchases, sales, dashboard, and reporting app for a shop using Next.js App Router and MongoDB.

## Authentication

- Single-user authentication only (no registration).
- Login with username + password.
- Password is verified using bcrypt hash comparison.
- Credentials are stored in MongoDB (`AuthUser`) with hashed password only.
- JWT session is stored in an HTTP-only cookie.
- All app pages except `/login` are protected via `proxy.ts`.
- All API routes validate authentication server-side and return `401 Unauthorized` when unauthenticated.
- Account page allows changing credentials after confirming current password.

## Tech Stack

- Frontend: Next.js (App Router) + React
- Backend: Next.js API routes
- Database: MongoDB + Mongoose
- Image storage: Cloudinary (optional) or local `public/uploads`

## Features Implemented

- Product management
	- Categories: Dresses, Bags, Perfumes
	- Add/Edit/Delete product
	- Name, category, purchase price, selling price, quantity, image upload
	- Low stock threshold + low stock alerts
	- Search/filter products
- Purchases
	- Record purchased items (product, quantity, cost per item, total cost, date)
	- Inventory auto-increases on purchase
- Sales
	- Record sales (product, quantity sold, selling price, total, date)
	- Inventory auto-decreases on sale
	- Prevent sale when stock is insufficient
- Daily dashboard
	- Total sales today
	- Total profit today
	- Items sold today
	- List of today sales
- Monthly reports
	- Total revenue
	- Total profit
	- Best-selling products
	- Date range filter
- Bonus
	- CSV export for sales report
	- Responsive UI with sidebar navigation

## Folder Structure

```text
src/
	app/
		api/
			dashboard/daily/route.ts
			products/route.ts
			products/[id]/route.ts
			purchases/route.ts
			sales/route.ts
			reports/monthly/route.ts
			reports/export/route.ts
			upload/route.ts
		products/page.tsx
		purchases/page.tsx
		sales/page.tsx
		reports/page.tsx
		layout.tsx
		page.tsx
		globals.css
	components/
		forms/ProductForm.tsx
		forms/PurchaseForm.tsx
		forms/SaleForm.tsx
		ProductList.tsx
		PurchasesList.tsx
		SalesList.tsx
		ReportsPanel.tsx
		Sidebar.tsx
		StatCard.tsx
	lib/
		mongodb.ts
		cloudinary.ts
	models/
		Product.ts
		Purchase.ts
		Sale.ts
	types/
		inventory.ts
```

## Environment Variables

1. Copy `.env.example` to `.env.local`.
2. Set values:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/shop_inventory

# Auth session secret for JWT signing
AUTH_JWT_SECRET=replace-with-a-long-random-secret

# Seed variables used by the seed script
AUTH_SEED_USERNAME=admin
AUTH_SEED_PASSWORD=replace-with-strong-password

# Optional. If empty, images are stored under /public/uploads.
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Create or rotate the single auth user

Run the seed command (it updates the existing user or creates one if missing):

```bash
npm run seed:user
```

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Main API Endpoints

- `GET /api/products` (supports `search`, `category`, `lowStock=true`)
- `POST /api/products`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/purchases`
- `POST /api/purchases`
- `GET /api/sales`
- `POST /api/sales`
- `GET /api/dashboard/daily`
- `GET /api/reports/monthly?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `GET /api/reports/export?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `POST /api/upload` (form-data key: `image`)
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/credentials` (change username/password)

## Notes

- Product images can be uploaded from file picker or camera (`capture="environment"`).
- Cloudinary is automatically used if credentials are configured.
- CSV export can be opened in Excel/Google Sheets.
