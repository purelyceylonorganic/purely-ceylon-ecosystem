import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { startNetworkListener } from "./offline/networkListener";
import WhatsAppButton from "./components/WhatsAppButton";

export default function App() {
  useEffect(() => {
    startNetworkListener();
  }, []);

  return (
    <>
      <AppRoutes />
      <WhatsAppButton />
    </>
  );
}