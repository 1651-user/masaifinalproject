# 🛍️ ShopLocal - E-Commerce Platform for Small Businesses

![ShopLocal](https://img.shields.io/badge/ShopLocal-E--Commerce-6366f1?style=for-the-badge&logo=shopify&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## 📋 Project Description

ShopLocal is a full-stack e-commerce platform designed to help small businesses sell their products online. It provides vendors with tools to manage products, orders, and promotions while giving customers a smooth shopping experience with search, filters, cart, checkout, order tracking, wishlist, and product reviews.

## ✨ Features

### Customer Features
- 🔐 User Authentication (Register/Login)
- 🔍 Product Search & Advanced Filters (category, price range, sorting)
- 🛒 Shopping Cart with Quantity Management
- 💳 Checkout with Coupon Code Support
- 📦 Order History with Status Tracking Timeline
- ❤️ Wishlist
- ⭐ Product Reviews & Ratings
- 🌙 Dark Mode Toggle
- 📱 Fully Responsive Design

### Vendor Features
- 📊 Sales Dashboard with Analytics Charts
- 📦 Product Management (CRUD)
- 🏷️ Coupon/Discount Management
- 📋 Order Management with Status Updates
- ⚠️ Low Stock Alerts
- 🏪 Store Profile

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS 4 | Styling |
| React Router DOM | Routing |
| Axios | API Communication |
| Lucide React | Icons |
| Recharts | Dashboard Charts |
| React Hot Toast | Notifications |
| Context API | State Management |

## 📂 Folder Structure

```
src/
├── components/       # Reusable UI components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── ProductCard.jsx
├── pages/            # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Products.jsx
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── CustomerDashboard.jsx
│   ├── VendorDashboard.jsx
│   └── Wishlist.jsx
├── context/          # React Context providers
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   └── ThemeContext.jsx
├── services/         # API service layer
│   ├── api.js
│   └── index.js
├── utils/            # Helper functions
│   └── helpers.js
├── App.jsx
├── main.jsx
└── index.css
```

## 🚀 Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-frontend-repo-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 🔗 Links

- **Deployed Frontend**: [Netlify Link](#)
- **Backend API**: [Render Link](#)
- **Backend Repository**: [GitHub Link](#)

## 🔑 Login Credentials (Demo)

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@test.com | password123 |
| Vendor | vendor@test.com | password123 |

## 📸 Screenshots

*Coming soon - Screenshots will be added after deployment*

## 🎥 Video Walkthrough

[Video Demo Link](#)

---

Made with ❤️ for small businesses
