import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import "./index.css";
import "./theme.css";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext"; 
import { AddressProvider } from "./context/AddressContext"; 
import { Toaster } from "react-hot-toast"; 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider> 
          <AddressProvider>
            <App />
            <Toaster position="top-right" reverseOrder={false} />
          </AddressProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);