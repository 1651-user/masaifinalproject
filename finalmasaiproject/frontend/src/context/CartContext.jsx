import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartService } from "../services";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const fetchCart = useCallback(async () => {
        if (!user) {
            setItems([]);
            return;
        }
        setLoading(true);
        try {
            const res = await cartService.get();
            setItems(res.data);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (productId, quantity = 1) => {
        await cartService.add(productId, quantity);
        await fetchCart();
    };

    const updateQuantity = async (itemId, quantity) => {
        await cartService.update(itemId, quantity);
        await fetchCart();
    };

    const removeItem = async (itemId) => {
        await cartService.remove(itemId);
        await fetchCart();
    };

    const clearCart = async () => {
        await cartService.clear();
        setItems([]);
    };

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, loading, addToCart, updateQuantity, removeItem, clearCart, fetchCart, itemCount, total }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
};
