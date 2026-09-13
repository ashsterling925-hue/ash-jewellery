import Home from "./Home";
import BanglePage from "./BanglePage";
import { usePathname } from "./router";
import "./App.css";

function App() {
  const pathname = usePathname();
  if (pathname === "/bangles" || pathname.startsWith("/bangles/")) return <BanglePage />;
  return <Home />;
}

export default App;
