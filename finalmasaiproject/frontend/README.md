# ShopLocal Frontend

React-based frontend for the ShopLocal multi-vendor e-commerce platform.

## Tech Stack

- React with Vite
- React Router for client-side routing
- Axios for API requests
- Lucide React for icons
- React Hot Toast for notifications

## Setup

Install dependencies:

```
npm install
```

Create a `.env` file in this directory:

```
VITE_API_URL=https://masaifinalproject-backend.onrender.com/api
```

Start the development server:

```
npm run dev
```

Build for production:

```
npm run build
```

## Project Structure

```
src/
  components/     Navbar, Footer, ProductCard
  context/        AuthContext, CartContext, ThemeContext
  pages/          One file per route (see below)
  services/       API call wrappers (api.js, index.js)
  utils/          Shared helpers (formatPrice, formatDate, etc.)
  App.jsx         Router and layout setup
  main.jsx        Application entry point
  index.css       Global styles and CSS variables
```

## Pages

| Route | Component | Access |
|-------|-----------|--------|
| / | Home | Public |
| /products | Products | Public |
| /products/:id | ProductDetail | Public |
| /login | Login | Public |
| /signup | Signup | Public |
| /cart | Cart | Customer only |
| /checkout | Checkout | Customer only |
| /wishlist | Wishlist | Customer only |
| /dashboard | CustomerDashboard | Customer only |
| /vendor/dashboard | VendorDashboard | Vendor only |

## Notes

- Vendors are redirected away from customer-only routes automatically.
- The theme (light/dark) is persisted via ThemeContext.
- All page components are lazy-loaded for code splitting.
