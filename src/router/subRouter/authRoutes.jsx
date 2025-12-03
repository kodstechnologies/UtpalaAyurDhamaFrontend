// src/routes/authRoutes.jsx
import Login from "../../pages/auth/Login";
// import Signup from "../../components/pages/login/Signup";
// import ForgotPassword from "../../components/pages/login/ForgotPassword";
// import ChangePassword from "../../components/pages/login/ChangePassword";

export const authRoutes = [
    { path: "/", element: <Login /> },
    { path: "/login", element: <Login /> },
    // { path: "/signup", element: <Signup /> },
    // { path: "/forgotpassword", element: <ForgotPassword /> },
    // { path: "/changepassword", element: <ChangePassword /> }
];
