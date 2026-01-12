import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Layout from "../components/layout/Layout";

import { authRoutes } from "./subRouter/authRoutes";
import { adminRoutes } from "./subRouter/adminRoutes";
import { doctorRoutes } from "./subRouter/doctorRoutes";
import { nurseRoutes } from "./subRouter/nurseRoutes";
import { receptionRoutes } from "./subRouter/receptionRoutes";
import { pharmacistRoutes } from "./subRouter/pharmacistRoutes";
import { therapistRoutes } from "./subRouter/therapistRouter";
import { patientRoutes } from "./subRouter/patientRouter";
import ScrollToTop from "./ScrollToTop";

// Component to redirect /dashboard based on user role
function DashboardRedirect() {
  const role = useSelector((state) => state.auth.role) || localStorage.getItem("role");
  const roleLower = role?.toLowerCase();

  if (roleLower === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (roleLower === "doctor") {
    return <Navigate to="/doctor/dashboard" replace />;
  } else if (roleLower === "nurse") {
    return <Navigate to="/nurse/dashboard" replace />;
  } else if (roleLower === "receptionist") {
    return <Navigate to="/receptionist/dashboard" replace />;
  } else if (roleLower === "pharmacist") {
    return <Navigate to="/pharmacist/dashboard" replace />;
  } else if (roleLower === "therapist") {
    return <Navigate to="/therapist/dashboard" replace />;
  } else if (roleLower === "patient") {
    return <Navigate to="/patient/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
}

function AppRouter() {
  return (
    <BrowserRouter>
      {/* 🔥 THIS MAKES EVERY PAGE SCROLL TO TOP */}
      <ScrollToTop />
      <Routes>


        {/* ===== PUBLIC ROUTES (LOGIN, REGISTER) ===== */}
        {authRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}

        {/* ===== PROTECTED ROUTES (WITH SIDEBAR + HEADER) ===== */}
        <Route element={<Layout />}>

          {/* Dashboard redirect route */}
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* ADMIN ROUTES */}
          {adminRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

          {/* DOCTOR ROUTES → MUST ADD */}
          {doctorRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          {/* NURSE ROUTES → MUST ADD */}
          {nurseRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          {/* RECEPTION ROUTES → MUST ADD */}
          {receptionRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          {/* PHARMACIST ROUTES → MUST ADD */}
          {pharmacistRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          {/* THERAPIST ROUTES → MUST ADD */}
          {therapistRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          {/* PATIENT ROUTES → MUST ADD */}
          {patientRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}

        </Route>

      </Routes>

      <div className="sidebar-overlay"></div>
    </BrowserRouter>
  );
}

export default AppRouter;
