import api from "./api";

export const authService = {
    register: (data) => api.post("/auth/register", data),
    login: (data) => api.post("/auth/login", data),
    getProfile: () => api.get("/auth/profile"),
    updateProfile: (data) => api.put("/auth/profile", data),
};

export const productService = {
    getAll: (params) => api.get("/products", { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post("/products", data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

export const categoryService = {
    getAll: () => api.get("/categories"),
    getById: (id) => api.get(`/categories/${id}`),
};

export const cartService = {
    get: () => api.get("/cart"),
    add: (product_id, quantity) => api.post("/cart", { product_id, quantity }),
    update: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
    remove: (id) => api.delete(`/cart/${id}`),
    clear: () => api.delete("/cart/clear"),
};

export const orderService = {
    create: (data) => api.post("/orders", data),
    getAll: () => api.get("/orders"),
    getById: (id) => api.get(`/orders/${id}`),
    updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
    cancel: (id) => api.put(`/orders/${id}/cancel`),
};

export const reviewService = {
    getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
    add: (productId, data) => api.post(`/reviews/product/${productId}`, data),
    update: (id, data) => api.put(`/reviews/${id}`, data),
    delete: (id) => api.delete(`/reviews/${id}`),
    voteHelpful: (id) => api.put(`/reviews/${id}/helpful`),
};

export const wishlistService = {
    get: () => api.get("/wishlist"),
    add: (product_id) => api.post("/wishlist", { product_id }),
    remove: (id) => api.delete(`/wishlist/${id}`),
};

export const couponService = {
    getAll: () => api.get("/coupons"),
    create: (data) => api.post("/coupons", data),
    validate: (code) => api.get(`/coupons/validate/${code}`),
    toggle: (id) => api.put(`/coupons/${id}/toggle`),
    delete: (id) => api.delete(`/coupons/${id}`),
};

export const vendorService = {
    getDashboard: () => api.get("/vendor/dashboard"),
    getOrders: () => api.get("/vendor/orders"),
    getProducts: () => api.get("/vendor/products"),
};

export const adminService = {
    getStats: () => api.get("/admin/stats"),
    getUsers: (params) => api.get("/admin/users", { params }),
    getUserById: (id) => api.get(`/admin/users/${id}`),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getAllOrders: (params) => api.get("/admin/orders", { params }),
    getAllProducts: (params) => api.get("/admin/products", { params }),
    toggleProductStatus: (id) => api.put(`/admin/products/${id}/toggle`),
    getSettings: () => api.get("/admin/settings"),
    updateSettings: (data) => api.put("/admin/settings", data),
};
