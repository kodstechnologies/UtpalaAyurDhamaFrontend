// src/router/subRouter/doctorRoutes.jsx

import React, { lazy } from "react";
import PatientDetails from "../../pages/doctor/PatientManagement/PatientDetails";

const Doctor_Dashboard = lazy(() =>
    import("../../pages/doctor/Dashboard")
);
const Doctor_Profile = lazy(() =>
    import("../../pages/doctor/Profile")
);

const All_Patients_View = lazy(() =>
    import("../../pages/doctor/Patients/View")
);
const FamilyMembers = lazy(() =>
    import("../../pages/doctor/Patients/FamilyMembers")
);

const Patient_Management_View = lazy(() =>
    import("../../pages/doctor/PatientManagement/View")
);

export {
    Doctor_Dashboard,
    All_Patients_View,
    Patient_Management_View
};


export const doctorRoutes = [
    // Doctor Module
    { path: "/doctor/dashboard", element: <Doctor_Dashboard /> },
    { path: "/doctor/profile", element: <Doctor_Profile /> },
    { path: "/doctor/my-patients", element: <All_Patients_View /> },
    { path: "/doctor/family-members/:userId", element: <FamilyMembers /> },
    { path: "/doctor/in-patients", element: <Patient_Management_View /> },
    { path: "/doctor/in-patients/:patientId", element: <PatientDetails /> },
];
