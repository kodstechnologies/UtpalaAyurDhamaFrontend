// src/router/subRouter/pharmacyRoutes.jsx

import { Helmet } from "react-helmet";

/* ==============================
   Pages
================================ */

// Dashboard & Profile
import Pharmacist_Dashboard from "../../pages/pharmacist/Dashboard";
import PharmacistProfile from "../../pages/pharmacist/Profile";

// Inventory
import Inventory_View_Details from "../../pages/pharmacist/inventory/View";
import BatchLogView from "../../pages/pharmacist/inventory/BatchLogView";
import BatchLogDetails from "../../pages/pharmacist/inventory/BatchLogDetails";

// Prescriptions – Outpatient
import Outpatient_View_Details from "../../pages/pharmacist/prescriptions/outpatient/View";
import OutpatientPrescriptions from "../../pages/pharmacist/prescriptions/outpatient/Outpatientprescriptions";

// Prescriptions – Inpatient
import Inpatient_View_Details from "../../pages/pharmacist/prescriptions/inpatient/View";
import InpatientPrescriptions from "../../pages/pharmacist/prescriptions/inpatient/Inpatientprescriptions";

/* ==============================
   Reusable SEO Wrapper
================================ */
const withHelmet = (title, description, Component) => (
    <>
        <Helmet>
            <title>{title} | UTPALA</title>
            <meta name="description" content={description} />
        </Helmet>
        <Component />
    </>
);

/* ==============================
   Pharmacist Routes
================================ */
export const pharmacistRoutes = [
    /* Dashboard */
    {
        path: "/pharmacist/dashboard",
        element: withHelmet(
            "Pharmacist Dashboard",
            "Overview of pharmacy operations, prescriptions, and inventory status.",
            Pharmacist_Dashboard
        ),
    },

    /* Profile */
    {
        path: "/pharmacist/profile",
        element: withHelmet(
            "Pharmacist Profile",
            "Manage pharmacist profile details and account information.",
            PharmacistProfile
        ),
    },

    /* Inventory */
    {
        path: "/pharmacist/inventory",
        element: withHelmet(
            "Inventory Management",
            "View and manage pharmacy inventory, stock levels, and medicines.",
            Inventory_View_Details
        ),
    },
    {
        path: "/pharmacist/batch-log/:id",
        element: withHelmet(
            "Batch Log",
            "View batch-wise stock logs, expiry dates, and movement history.",
            BatchLogView
        ),
    },
    {
        path: "/pharmacist/inventory/batch-log-details",
        element: withHelmet(
            "Batch Log Details",
            "View detailed batch log information including expiry dates and supplier details.",
            BatchLogDetails
        ),
    },

    /* Outpatient Prescriptions */
    {
        path: "/pharmacist/prescriptions/outpatient",
        element: withHelmet(
            "Outpatient Prescriptions",
            "Review and dispense outpatient prescriptions received from doctors.",
            Outpatient_View_Details
        ),
    },
    {
        path: "/pharmacist/prescriptions/outpatient/:id",
        element: withHelmet(
            "Outpatient Prescription Details",
            "View detailed outpatient prescription and dispensing information.",
            OutpatientPrescriptions
        ),
    },

    /* Inpatient Prescriptions */
    {
        path: "/pharmacist/prescriptions/inpatient",
        element: withHelmet(
            "Inpatient Prescriptions",
            "Manage inpatient prescriptions and medicine dispensing.",
            Inpatient_View_Details
        ),
    },
    {
        path: "/pharmacist/prescriptions/inpatient/:id",
        element: withHelmet(
            "Inpatient Prescription Details",
            "View detailed inpatient prescription and dispensing information.",
            InpatientPrescriptions
        ),
    },
];
