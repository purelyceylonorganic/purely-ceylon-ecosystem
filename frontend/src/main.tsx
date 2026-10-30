
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

import "./index.css";
import "./theme.css";

import { AuthProvider } from "./context/AuthContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AddressProvider } from "./context/AddressContext";
import { Toaster } from "react-hot-toast";

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer: unknown[][];
    gtag?: (...args: any[]) => void;
  }
}

function initializeGoogleAnalytics(): void {
  if (
    typeof window === "undefined" ||
    !GA_MEASUREMENT_ID
  ) {
    console.warn(
      "Google Analytics Measurement ID is missing."
    );
    return;
  }

  // Prevent duplicate initialization
  if (window.gtag) {
    return;
  }

  window.dataLayer = window.dataLayer || [];

  // Initialize gtag
  window.gtag = function (...args: any[]): void {
    window.dataLayer.push(args);
  };

  // Load Google Analytics script
  const script = document.createElement("script");

  script.async = true;
  script.src =
    `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

  document.head.appendChild(script);

  // Configure Google Analytics
  window.gtag("js", new Date());

  window.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: true,
  });
}

// Initialize Google Analytics once
initializeGoogleAnalytics();

// Render React application
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <CurrencyProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AddressProvider>
              <App />
              <Toaster
                position="top-right"
                reverseOrder={false}
              />
            </AddressProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </CurrencyProvider>
  </StrictMode>
);
