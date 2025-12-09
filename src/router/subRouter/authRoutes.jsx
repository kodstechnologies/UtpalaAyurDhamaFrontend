// src/routes/authRoutes.jsx
// import path from "path";
import Login from "../../pages/auth/Login";
import PageNotFound from "../../pages/auth/PageNotFound";

export const authRoutes = [
    { path: "/", element: <Login /> },
    { path: "/login", element: <Login /> },
    { path: "*", element: <PageNotFound /> },
];
