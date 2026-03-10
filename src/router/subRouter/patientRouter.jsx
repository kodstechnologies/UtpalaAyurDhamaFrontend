import React, { lazy, Suspense } from "react";
// import PatientProfile from "../../pages/patient/Profile";
// import Family_Members_View from "../../pages/patient/familyMembers/View";
// Lazy-loaded components
const Patient_Dashboard = lazy(() =>
    import("../../pages/patient/Dashboard")
);
const PatientProfile = lazy(() =>
    import("../../pages/patient/Profile")
);

const Family_Members_View = lazy(() =>
    import("../../pages/patient/familyMembers/View")
);

const Consultations_View = lazy(() =>
    import("../../pages/patient/consultations/View")
);

const Consultation_Details = lazy(() =>
    import("../../pages/patient/consultations/Details")
);

const Prescriptions_View = lazy(() =>
    import("../../pages/patient/prescriptions/View")
);

const Prescription_Details = lazy(() =>
    import("../../pages/patient/prescriptions/Details")
);

const Therapies_View = lazy(() =>
    import("../../pages/patient/therapies/View")
);
const Reports_View = lazy(() =>
    import("../../pages/patient/reports/View")
);

const AddMemberPage = lazy(() =>
    import("../../pages/patient/familyMembers/AddMember")
);

const EditMemberPage = lazy(() =>
    import("../../pages/patient/familyMembers/Edit")
);

const InvoicePage = lazy(() =>
    import("../../pages/patient/reports/Invoice")
);

const FollowUps_View = lazy(() =>
    import("../../pages/patient/followUps/View")
);

// Routes configuration for patient panel
// eslint-disable-next-line react-refresh/only-export-components
export const patientRoutes = [
    { 
        path: "/patient/profile", 
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <PatientProfile />
            </Suspense>
        )
    },
    { 
        path: "/patient/dashboard", 
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Patient_Dashboard />
            </Suspense>
        )
    },
    { 
        path: "/patient/family", 
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Family_Members_View />
            </Suspense>
        )
    },
    { 
        path: "/patient/family/add", 
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <AddMemberPage />
            </Suspense>
        )
    },
    { 
        path: "/patient/family/edit/:id", 
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <EditMemberPage />
            </Suspense>
        )
    },
    { 
        path: "/patient/consultations", 
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Consultations_View />
            </Suspense>
        )
    },
    { 
        path: "/patient/consultations/:id", 
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Consultation_Details />
            </Suspense>
        )
    },
    { 
        path: "/patient/prescriptions", 
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Prescriptions_View />
            </Suspense>
        )
    },
    { 
        path: "/patient/prescriptions/:id", 
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Prescription_Details />
            </Suspense>
        )
    },
    { 
        path: "/patient/therapies", 
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Therapies_View />
            </Suspense>
        )
    },
    { 
        path: "/patient/reports", 
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <Reports_View />
            </Suspense>
        )
    },
    { 
        path: "/patient/reports/invoice/:id", 
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <InvoicePage />
            </Suspense>
        )
    },
    { 
        path: "/patient/reports/invoice", 
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <InvoicePage />
            </Suspense>
        )
    },
    { 
        path: "/patient/follow-ups", 
        element: (
            <Suspense fallback={<div>Loading...</div>}>
                <FollowUps_View />
            </Suspense>
        )
    },
];
