import { lazy } from "react";
import { Suspense } from "react";

// ⏳ Lazy Imports
const Therapist_Dashboard = lazy(() =>
    import("../../pages/therapist/Dashboard")
);
const Patient_List_View = lazy(() =>
    import("../../pages/therapist/patientDetails/View")
);
const Therapy_Progress = lazy(() =>
    import("../../pages/therapist/appointments/View")
);
const Entry_Exit = lazy(() =>
    import("../../pages/therapist/entryExit/EntryExit")
);
const Treatment_Details = lazy(() =>
    import("../../pages/therapist/treatmentDetails/TreatmentDetails")
);

// 🛣 Routes with Lazy Components
export const therapistRoutes = [
    {
        path: "/therapist/dashboard",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Therapist_Dashboard />
            </Suspense>
        ),
    },
    {
        path: "/therapist/patient-monitoring",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Patient_List_View />
            </Suspense>
        ),
    },
    {
        path: "/therapist/therapy-progress",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Therapy_Progress />
            </Suspense>
        ),
    },
    {
        path: "/therapist/entry-exit",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Entry_Exit />
            </Suspense>
        ),
    },
    {
        path: "/therapist/treatment-details",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Treatment_Details />
            </Suspense>
        ),
    },
];
