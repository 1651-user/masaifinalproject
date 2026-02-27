import { createContext, useContext, useState, useEffect } from "react";
import { wishlistService } from "../services";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role === "customer") {
            wishlistService.get()
                .then((res) => {
                    const items = res.data.map(item => item.product_id);
                    setWishlistItems(items);
                })
                .catch(() => {
                    setWishlistItems([]);
                })
                .finally(() => setLoading(false));
        } else {
            setWishlistItems([]);
            setLoading(false);
        }
    }, [user]);

    const addToWishlist = async (productId) => {
        if (!user) { toast.error("Sign in to save items"); return false; }
        if (user.role === "vendor") { toast.error("Vendors cannot save items"); return false; }
        try {
            await wishlistService.add(productId);
            setWishlistItems((prev) => [...prev, productId]);
            toast.success("Saved to favourites");
            return true;
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to save item");
            return false;
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            await wishlistService.remove(productId);
            setWishlistItems((prev) => prev.filter((id) => id !== productId));
            toast.success("Removed from favourites");
            return true;
        } catch (error) {
            toast.error("Failed to remove item");
            return false;
        }
    };

    const toggleWishlist = async (productId) => {
        if (wishlistItems.includes(productId)) {
            return await removeFromWishlist(productId);
        } else {
            return await addToWishlist(productId);
        }
    };

    const isWishlisted = (productId) => wishlistItems.includes(productId);

    return (
        <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, toggleWishlist, isWishlisted, loading }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
