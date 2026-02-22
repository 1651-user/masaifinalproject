# 🛍️ ShopLocal Backend - E-Commerce API

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

## 📋 Project Overview

RESTful API backend for ShopLocal, an e-commerce platform empowering small businesses. Built with Node.js, Express.js, and Supabase (PostgreSQL). Implements MVC architecture with JWT authentication, role-based access control, and comprehensive error handling.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express.js | Web Framework |
| Supabase | Database (PostgreSQL) |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| Morgan | Request Logging |
| CORS | Cross-Origin Support |

## 📂 Folder Structure

```
backend/
├── config/
│   └── supabase.js          # Supabase client config
├── controllers/
│   ├── authController.js     # Auth logic
│   ├── productController.js  # Product CRUD
│   ├── categoryController.js # Categories
│   ├── cartController.js     # Cart management
│   ├── orderController.js    # Order processing
│   ├── reviewController.js   # Reviews & ratings
│   ├── wishlistController.js # Wishlist
│   ├── couponController.js   # Coupons & discounts
│   └── vendorController.js   # Vendor dashboard
├── database/
│   └── schema.sql            # Database schema
├── middleware/
│   ├── auth.js               # JWT auth + role guards
│   └── errorHandler.js       # Global error handler
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── categories.js
│   ├── cart.js
│   ├── orders.js
│   ├── reviews.js
│   ├── wishlist.js
│   ├── coupons.js
│   └── vendor.js
└── server.js                 # Entry point
```

## 📡 API Documentation

### Auth Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/auth/profile` | Get profile | ✅ |
| PUT | `/api/auth/profile` | Update profile | ✅ |

### Product Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | List products (search, filter, paginate) | ❌ |
| GET | `/api/products/:id` | Get product detail | ❌ |
| POST | `/api/products` | Create product | ✅ Vendor |
| PUT | `/api/products/:id` | Update product | ✅ Vendor |
| DELETE | `/api/products/:id` | Delete product | ✅ Vendor |

### Category Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | List all categories | ❌ |
| GET | `/api/categories/:id` | Get category | ❌ |

### Cart Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cart` | Get cart items | ✅ |
| POST | `/api/cart` | Add to cart | ✅ |
| PUT | `/api/cart/:id` | Update quantity | ✅ |
| DELETE | `/api/cart/:id` | Remove item | ✅ |
| DELETE | `/api/cart/clear` | Clear cart | ✅ |

### Order Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Create order | ✅ |
| GET | `/api/orders` | Get my orders | ✅ |
| GET | `/api/orders/:id` | Get order detail | ✅ |
| PUT | `/api/orders/:id/status` | Update status | ✅ Vendor |

### Review Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reviews/product/:id` | Get product reviews | ❌ |
| POST | `/api/reviews/product/:id` | Add review | ✅ |
| DELETE | `/api/reviews/:id` | Delete review | ✅ |

### Wishlist Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/wishlist` | Get wishlist | ✅ |
| POST | `/api/wishlist` | Add to wishlist | ✅ |
| DELETE | `/api/wishlist/:id` | Remove | ✅ |

### Coupon Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/coupons/validate/:code` | Validate coupon | ❌ |
| GET | `/api/coupons` | Get vendor coupons | ✅ Vendor |
| POST | `/api/coupons` | Create coupon | ✅ Vendor |
| PUT | `/api/coupons/:id/toggle` | Toggle active | ✅ Vendor |
| DELETE | `/api/coupons/:id` | Delete coupon | ✅ Vendor |

### Vendor Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/vendor/dashboard` | Dashboard stats | ✅ Vendor |
| GET | `/api/vendor/orders` | Vendor orders | ✅ Vendor |
| GET | `/api/vendor/products` | Vendor products | ✅ Vendor |

## 🗄️ Database Schema

### Entity Relationship Diagram

```
users ──┬── products ──┬── cart_items
        │              ├── order_items ── orders
        │              ├── reviews
        │              └── wishlists
        ├── orders
        ├── reviews
        ├── wishlists
        └── coupons

categories ── products
```

### Tables

| Table | Key Columns | Relationships |
|-------|-------------|---------------|
| **users** | id, email, name, role (customer/vendor) | → products, orders, reviews, wishlist, coupons |
| **categories** | id, name, slug | → products |
| **products** | id, vendor_id, category_id, name, price, stock | FK → users, categories |
| **cart_items** | id, user_id, product_id, quantity | FK → users, products |
| **orders** | id, user_id, total, status | FK → users |
| **order_items** | id, order_id, product_id, vendor_id, quantity, price | FK → orders, products, users |
| **reviews** | id, user_id, product_id, rating, comment | FK → users, products |
| **wishlists** | id, user_id, product_id | FK → users, products |
| **coupons** | id, vendor_id, code, discount_percent, expires_at | FK → users |

## 🚀 Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-backend-repo-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run `database/schema.sql`

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_role_key
   JWT_SECRET=your_secret_key
   FRONTEND_URL=http://localhost:5173
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

## 🔗 Deployment

- **Deployed on**: [Render](#)
- **Frontend**: [Netlify Link](#)

---

Made with ❤️ for small businesses
