# ShopLocal

ShopLocal is a multi-vendor e-commerce platform that allows small businesses and independent sellers to list and sell products online. Customers can browse products, manage a cart, place orders, and track their purchase history.

## Live

Backend: https://masaifinalproject-backend.onrender.com

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Axios
- Lucide React (icons)
- React Hot Toast

**Backend**
- Node.js with Express
- Supabase (PostgreSQL database and file storage)
- JSON Web Tokens for authentication
- Multer for file upload handling
- Bcrypt for password hashing
- Helmet and express-rate-limit for security

## Features

**Customer**
- Browse and search products by category, price, and keyword
- Add products to cart or wishlist
- Place and track orders
- Leave product reviews

**Vendor**
- Register as a vendor and manage a personal dashboard
- Create, edit, and delete product listings
- Upload product images directly from device or via URL
- View order history and revenue analytics
- Create discount coupons

**General**
- JWT-based authentication with role separation (customer and vendor)
- Vendors cannot access cart, checkout, or wishlist
- Dark and light theme support

## Project Structure

```
finalmasaiproject/
  backend/
    config/         Supabase client setup
    controllers/    Route handler logic
    middleware/     Auth and error handling
    routes/         API route definitions
    database/       Schema SQL reference
    server.js       Express app entry point
  frontend/
    src/
      components/   Navbar, Footer, ProductCard
      context/      Auth, Cart, Theme providers
      pages/        All page components
      services/     API call functions
      utils/        Shared helper functions
```

## Setup

### Backend

1. Navigate to the backend directory and install dependencies:

```
npm install
```

2. Create a `.env` file with the following variables:

```
PORT=5000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

3. Start the development server:

```
npm run dev
```

### Frontend

1. Navigate to the frontend directory and install dependencies:

```
npm install
```

2. Create a `.env` file:

```
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:

```
npm run dev
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Log in and receive a JWT |
| GET | /api/products | List all products |
| GET | /api/products/:id | Get a single product |
| POST | /api/products | Create a product (vendor only) |
| PUT | /api/products/:id | Update a product (vendor only) |
| DELETE | /api/products/:id | Delete a product (vendor only) |
| GET | /api/categories | List all categories |
| POST | /api/cart | Add item to cart |
| GET | /api/orders | Get order history |
| POST | /api/upload | Upload a product image (vendor only) |
| GET | /api/vendor/dashboard | Vendor sales and analytics |

## Environment Notes

- The Supabase storage bucket named `product-images` must exist and be set to public for product image uploads to work.
- The `FRONTEND_URL` variable in the backend controls which origin is allowed by CORS. Update this to your deployed frontend URL when deploying.
