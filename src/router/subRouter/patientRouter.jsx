import React, { lazy } from "react";
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


export const patientRoutes = [
    { path: "/patient/profile", element: <PatientProfile /> },
    { path: "/patient/dashboard", element: <Patient_Dashboard /> },
    { path: "/patient/family", element: < Family_Members_View /> },
    { path: "/patient/family/add", element: <AddMemberPage /> },
    { path: "/patient/family/edit/:id", element: <EditMemberPage /> },
    { path: "/patient/consultations", element: <Consultations_View /> },
    { path: "/patient/consultations/:id", element: <Consultation_Details /> },
    { path: "/patient/prescriptions", element: <Prescriptions_View /> },
    { path: "/patient/prescriptions/:id", element: <Prescription_Details /> },
    { path: "/patient/therapies", element: <Therapies_View /> },
    { path: "/patient/reports", element: <Reports_View /> },
    { path: "/patient/reports/invoice/:id", element: <InvoicePage /> },
    { path: "/patient/reports/invoice", element: <InvoicePage /> },
];
