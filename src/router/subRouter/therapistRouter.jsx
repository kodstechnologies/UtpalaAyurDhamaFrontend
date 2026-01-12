import { lazy } from "react";
import { Suspense } from "react";

// ⏳ Lazy Imports
const Therapist_Dashboard = lazy(() =>
    import("../../pages/therapist/Dashboard")
);
const TherapistProfile = lazy(() =>
    import("../../pages/therapist/Profile")
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
const EditDurationPage = lazy(() =>
    import("../../pages/therapist/treatmentDetails/EditDuration")
);
const DeleteConfirmationPage = lazy(() =>
    import("../../pages/therapist/treatmentDetails/DeleteConfirmation")
);
const ViewPatientDetailsPage = lazy(() =>
    import("../../pages/therapist/patientDetails/ViewPatientDetails")
);
const AddEditEntryPage = lazy(() =>
    import("../../pages/therapist/entryExit/AddEditEntry")
);
const PatientTherapyDetailsPage = lazy(() =>
    import("../../pages/therapist/appointments/PatientTherapyDetails")
);
const ExecutionPage = lazy(() =>
    import("../../pages/therapist/appointments/Execution")
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
        path: "/therapist/profile",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <TherapistProfile />
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
    {
        path: "/therapist/treatment-details/edit-duration",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <EditDurationPage />
            </Suspense>
        ),
    },
    {
        path: "/therapist/treatment-details/delete",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <DeleteConfirmationPage />
            </Suspense>
        ),
    },
    {
        path: "/therapist/patient-monitoring/view",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <ViewPatientDetailsPage />
            </Suspense>
        ),
    },
    {
        path: "/therapist/entry-exit/add",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AddEditEntryPage />
            </Suspense>
        ),
    },
    {
        path: "/therapist/entry-exit/edit",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AddEditEntryPage />
            </Suspense>
        ),
    },
    {
        path: "/therapist/therapy-progress/details",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <PatientTherapyDetailsPage />
            </Suspense>
        ),
    },
    {
        path: "/therapist/therapy-progress/execution/:id",
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <ExecutionPage />
            </Suspense>
        ),
    },
];
