import Patient_Monitoring from "../../pages/nurse/monitoring/Monitoring";
import Discharge_Preparation from "../../pages/nurse/discharge/Discharge";
import Nurse_Dashboard from "../../pages/nurse/Dashboard";

export const nurseRoutes = [
    { path: "/nurse/dashboard", element: <Nurse_Dashboard /> },
    { path: "/nurse/monitoring", element: <Patient_Monitoring /> },
    { path: "/nurse/patients", element: <Discharge_Preparation /> },
];
