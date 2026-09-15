import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Home";
import BanglePage from "./BanglePage";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bangles" element={<BanglePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;