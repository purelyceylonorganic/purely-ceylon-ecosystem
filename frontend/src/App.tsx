import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { startNetworkListener } from "./offline/networkListener";

export default function App() {
  useEffect(() => {
    startNetworkListener();
  }, []);

  return <AppRoutes />;
}