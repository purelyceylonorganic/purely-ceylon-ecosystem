import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";
import { wishlistService } from "../services/wishlist.service";

// Context-க்கான Interface
interface WishlistContextType {
  wishlistCount: number;
  refreshWishlist: () => Promise<void>;
}

// ஆரம்ப நிலை Context உருவாக்கம்
const WishlistContext = createContext<WishlistContextType>({
  wishlistCount: 0,
  refreshWishlist: async () => {},
});

// Provider Component
export function WishlistProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [wishlistCount, setWishlistCount] = useState(0);

  // விஷ்லிஸ்ட் எண்ணிக்கையைப் புதுப்பிக்கும் பங்க்ஷன்
  async function refreshWishlist() {
    try {
      const response = await wishlistService.getWishlist();
      
      // ஏபிஐ ரெஸ்பான்ஸ் அமைப்பிற்கு ஏற்ப (response.items அல்லது response.wishlist.items)
      const items = response?.items || response?.wishlist?.items || response?.data?.items || [];
      setWishlistCount(items.length);
    } catch (error) {
      console.error("Wishlist Context Error:", error);
      setWishlistCount(0);
    }
  }

  // காம்போனென்ட் லோடாகும் போது தானாக இயங்க
  useEffect(() => {
    refreshWishlist();
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlistCount,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// Custom Hook
export function useWishlist() {
  return useContext(WishlistContext);
}