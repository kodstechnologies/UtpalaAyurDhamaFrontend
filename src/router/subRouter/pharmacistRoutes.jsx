// src/router/subRouter/pharmacyRoutes.jsx

import { lazy } from "react";
import { Helmet } from "react-helmet";

/* ==============================
   Lazy-loaded Pages
================================ */

// Dashboard & Profile
const Pharmacist_Dashboard = lazy(() => import("../../pages/pharmacist/Dashboard"));
const PharmacistProfile = lazy(() => import("../../pages/pharmacist/Profile"));

// Inventory
const Inventory_View_Details = lazy(() => import("../../pages/pharmacist/inventory/View"));
const InventoryDetails = lazy(() => import("../../pages/pharmacist/inventory/Details"));
const BatchLogView = lazy(() => import("../../pages/pharmacist/inventory/BatchLogView"));
const BatchLogDetails = lazy(() => import("../../pages/pharmacist/inventory/BatchLogDetails"));

// Prescriptions – Outpatient
const Outpatient_View_Details = lazy(() => import("../../pages/pharmacist/prescriptions/outpatient/View"));
const OutpatientPrescriptions = lazy(() => import("../../pages/pharmacist/prescriptions/outpatient/Outpatientprescriptions"));

// Prescriptions – Inpatient
const Inpatient_View_Details = lazy(() => import("../../pages/pharmacist/prescriptions/inpatient/View"));
const InpatientPrescriptions = lazy(() => import("../../pages/pharmacist/prescriptions/inpatient/Inpatientprescriptions"));

// Prescriptions – Inpatient
const List_View_Details = lazy(() => import("../../pages/pharmacist/prescriptions/list/View"));
const ListPrescriptions = lazy(() => import("../../pages/pharmacist/prescriptions/list/Listprescriptions"));
const OutsideDispense_View = lazy(() => import("../../pages/pharmacist/prescriptions/outside/View"));
const OutsideDispense_Add = lazy(() => import("../../pages/pharmacist/prescriptions/outside/Add"));
const OutsideDispense_Edit = lazy(() => import("../../pages/pharmacist/prescriptions/outside/Edit"));
const OutsideDispense_Details = lazy(() => import("../../pages/pharmacist/prescriptions/outside/Details"));

// Medicines
const MedicinesView = lazy(() => import("../../pages/pharmacist/medicines/View"));
const AddEditMedicine = lazy(() => import("../../pages/pharmacist/medicines/AddEdit"));
const MedicineDetails = lazy(() => import("../../pages/pharmacist/medicines/Details"));

/* ==============================
   Pharmacist Routes
================================ */
export const pharmacistRoutes = [
    /* Dashboard */
    {
        path: "/pharmacist/dashboard",
        element: (
            <>
                <Helmet>
                    <title>Pharmacist Dashboard | UTPALA</title>
                    <meta name="description" content="Overview of pharmacy operations, prescriptions, and inventory status." />
                </Helmet>
                <Pharmacist_Dashboard />
            </>
        ),
    },

    /* Profile */
    {
        path: "/pharmacist/profile",
        element: (
            <>
                <Helmet>
                    <title>Pharmacist Profile | UTPALA</title>
                    <meta name="description" content="Manage pharmacist profile details and account information." />
                </Helmet>
                <PharmacistProfile />
            </>
        ),
    },

    /* Inventory */
    {
        path: "/pharmacist/inventory",
        element: (
            <>
                <Helmet>
                    <title>Inventory Management | UTPALA</title>
                    <meta name="description" content="View and manage pharmacy inventory, stock levels, and medicines." />
                </Helmet>
                <Inventory_View_Details />
            </>
        ),
    },
    {
        path: "/pharmacist/inventory/view/:id",
        element: (
            <>
                <Helmet>
                    <title>Inventory Details | UTPALA</title>
                    <meta name="description" content="View detailed inventory information for a medicine." />
                </Helmet>
                <InventoryDetails />
            </>
        ),
    },
    {
        path: "/pharmacist/batch-log/:id",
        element: (
            <>
                <Helmet>
                    <title>Batch Log | UTPALA</title>
                    <meta name="description" content="View batch-wise stock logs, expiry dates, and movement history." />
                </Helmet>
                <BatchLogView />
            </>
        ),
    },
    {
        path: "/pharmacist/inventory/batch-log-details",
        element: (
            <>
                <Helmet>
                    <title>Batch Log Details | UTPALA</title>
                    <meta name="description" content="View detailed batch log information including expiry dates and supplier details." />
                </Helmet>
                <BatchLogDetails />
            </>
        ),
    },

    /* Outpatient Prescriptions */
    {
        path: "/pharmacist/prescriptions/outpatient",
        element: (
            <>
                <Helmet>
                    <title>Outpatient Prescriptions | UTPALA</title>
                    <meta name="description" content="Review and dispense outpatient prescriptions received from doctors." />
                </Helmet>
                <Outpatient_View_Details />
            </>
        ),
    },
    {
        path: "/pharmacist/prescriptions/outpatient/:id",
        element: (
            <>
                <Helmet>
                    <title>Outpatient Prescription Details | UTPALA</title>
                    <meta name="description" content="View detailed outpatient prescription and dispensing information." />
                </Helmet>
                <OutpatientPrescriptions />
            </>
        ),
    },

    /* Inpatient Prescriptions */
    {
        path: "/pharmacist/prescriptions/inpatient",
        element: (
            <>
                <Helmet>
                    <title>Inpatient Prescriptions | UTPALA</title>
                    <meta name="description" content="Manage inpatient prescriptions and medicine dispensing." />
                </Helmet>
                <Inpatient_View_Details />
            </>
        ),
    },
    {
        path: "/pharmacist/prescriptions/inpatient/:id",
        element: (
            <>
                <Helmet>
                    <title>Inpatient Prescription Details | UTPALA</title>
                    <meta name="description" content="View detailed inpatient prescription and dispensing information." />
                </Helmet>
                <InpatientPrescriptions />
            </>
        ),
    },
    /* list Prescriptions */
    {
        path: "/pharmacist/prescriptions/list",
        element: (
            <>
                <Helmet>
                    <title>List Prescriptions | UTPALA</title>
                    <meta name="description" content="Manage inpatient prescriptions and medicine dispensing." />
                </Helmet>
                <List_View_Details />
            </>
        ),
    },
    {
        path: "/pharmacist/prescriptions/list/:id",
        element: (
            <>
                <Helmet>
                    <title>List Prescription Details | UTPALA</title>
                    <meta name="description" content="View detailed inpatient prescription and dispensing information." />
                </Helmet>
                <ListPrescriptions />
            </>
        ),
    },
    {
        path: "/pharmacist/prescriptions/outside",
        element: (
            <>
                <Helmet>
                    <title>Outside Dispense | UTPALA</title>
                    <meta name="description" content="Dispense medicines to outside walk-in customers." />
                </Helmet>
                <OutsideDispense_View />
            </>
        ),
    },
    {
        path: "/pharmacist/prescriptions/outside/add",
        element: (
            <>
                <Helmet>
                    <title>Add Outside Dispense | UTPALA</title>
                    <meta name="description" content="Add outside walk-in medicine dispense record." />
                </Helmet>
                <OutsideDispense_Add />
            </>
        ),
    },
    {
        path: "/pharmacist/prescriptions/outside/edit/:id",
        element: (
            <>
                <Helmet>
                    <title>Edit Outside Dispense | UTPALA</title>
                    <meta name="description" content="Edit outside walk-in medicine dispense record." />
                </Helmet>
                <OutsideDispense_Edit />
            </>
        ),
    },
    {
        path: "/pharmacist/prescriptions/outside/:id",
        element: (
            <>
                <Helmet>
                    <title>Outside Dispense Details | UTPALA</title>
                    <meta name="description" content="View outside walk-in medicine dispense details." />
                </Helmet>
                <OutsideDispense_Details />
            </>
        ),
    },

    /* Medicines */
    {
        path: "/pharmacist/medicines",
        element: (
            <>
                <Helmet>
                    <title>Medicine Management | UTPALA</title>
                    <meta name="description" content="View and manage all medicines in the pharmacy inventory." />
                </Helmet>
                <MedicinesView />
            </>
        ),
    },
    {
        path: "/pharmacist/medicines/add",
        element: (
            <>
                <Helmet>
                    <title>Add Medicine | UTPALA</title>
                    <meta name="description" content="Add a new medicine to the pharmacy inventory." />
                </Helmet>
                <AddEditMedicine />
            </>
        ),
    },
    {
        path: "/pharmacist/medicines/edit/:id",
        element: (
            <>
                <Helmet>
                    <title>Edit Medicine | UTPALA</title>
                    <meta name="description" content="Update medicine information." />
                </Helmet>
                <AddEditMedicine />
            </>
        ),
    },
    {
        path: "/pharmacist/medicines/view/:id",
        element: (
            <>
                <Helmet>
                    <title>Medicine Details | UTPALA</title>
                    <meta name="description" content="View complete information about the medicine." />
                </Helmet>
                <MedicineDetails />
            </>
        ),
    },
];
