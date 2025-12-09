import { lazy } from "react";

const Nurse_Dashboard = lazy(() =>
    import("../../pages/nurse/Dashboard")
);

const Patient_Monitoring = lazy(() =>
    import("../../pages/nurse/monitoring/Monitoring")
);

const Discharge_Preparation = lazy(() =>
    import("../../pages/nurse/discharge/Discharge")
);

export const nurseRoutes = [
    { path: "/nurse/dashboard", element: <Nurse_Dashboard /> },
    { path: "/nurse/monitoring", element: <Patient_Monitoring /> },
    { path: "/nurse/discharge-preparation", element: <Discharge_Preparation /> },
];
