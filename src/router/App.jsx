import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../components/layout/Layout";

import { authRoutes } from "./subRouter/authRoutes";
import { adminRoutes } from "./subRouter/adminRoutes";
// import other route groups here

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ROUTES (NO SIDEBAR/HEADER) ================= */}
        {authRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}

        {/* ================= PROTECTED ROUTES WRAPPED WITH LAYOUT ================= */}
        <Route element={<Layout />}>
          {adminRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Route>

      </Routes>

      <div className="sidebar-overlay"></div>
    </BrowserRouter>
  );
}

export default AppRouter;
