// src/router/subRouter/receptionRoutes.jsx

import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet";
import { CircularProgress, Box } from "@mui/material";

const Appointments_View = lazy(() => import("../../pages/receptionist/appointments/View"));
const Receptionist_dashboard = lazy(() => import("../../pages/receptionist/dashboard"));
const Inpatient_View = lazy(() => import("../../pages/receptionist/inpatient/View"));
const Outpatient_View = lazy(() => import("../../pages/receptionist/outpatient/View"));
const InpatientBilling = lazy(() => import("../../pages/receptionist/inpatient/Billing"));
const OutpatientBilling = lazy(() => import("../../pages/receptionist/outpatient/Billing"));
const Marketing_View = lazy(() => import("../../pages/receptionist/marketing/View"));
const Payments_View = lazy(() => import("../../pages/receptionist/payments/View"));
const InvoiceDetails = lazy(() => import("../../pages/receptionist/payments/InvoiceDetails"));
const Reports_View = lazy(() => import("../../pages/receptionist/reports/View"));
const Treatments_View = lazy(() => import("../../pages/receptionist/treatments/View"));
const PatientTherapyDetails = lazy(() => import("../../pages/receptionist/treatments/PatientTherapyDetails"));
const ReceptionistProfile = lazy(() => import("../../pages/receptionist/Profile"));
const SwarnaBinduEvents_Calendar = lazy(() => import("../../pages/receptionist/swarnaBinduEvents/View"));
const PatientHistory = lazy(() => import("../../pages/receptionist/patient/PatientHistory"));
const WalkInHub = lazy(() => import("../../pages/receptionist/WalkInPatient/WalkInHub"));

// Modal pages
const AddEditTransactionPage = lazy(() => import("../../pages/receptionist/payments/AddEditTransaction"));
const DeleteTransactionPage = lazy(() => import("../../pages/receptionist/payments/DeleteTransaction"));
const AdmitPatientPage = lazy(() => import("../../pages/receptionist/inpatient/AdmitPatient"));
const AllocateResourcesPage = lazy(() => import("../../pages/receptionist/inpatient/AllocateResources"));
const OutpatientAllocateResourcesPage = lazy(() => import("../../pages/receptionist/outpatient/AllocateResources"));
const AddPatientPage = lazy(() => import("../../pages/receptionist/appointments/AddPatient"));
const ScheduleAppointmentPage = lazy(() => import("../../pages/receptionist/appointments/ScheduleAppointment"));
const RescheduleAppointmentPage = lazy(() => import("../../pages/receptionist/appointments/RescheduleAppointment"));
const ViewPatientPage = lazy(() => import("../../pages/receptionist/appointments/ViewPatient"));
const WhatsAppPage = lazy(() => import("../../pages/receptionist/appointments/WhatsApp"));
const ScheduleTherapyPage = lazy(() => import("../../pages/receptionist/appointments/ScheduleTherapy"));
const WalkInAppointmentPage = lazy(() => import("../../pages/receptionist/appointments/WalkInAppointment"));
const EditChargePage = lazy(() => import("../../pages/receptionist/inpatient/EditCharge"));

export const receptionRoutes = [
    {
        path: "/receptionist/profile",
        element: (
            <>
                <Helmet>
                    <title>Receptionist Profile | UTPALA</title>
                </Helmet>
                <ReceptionistProfile />
            </>
        ),
    },
    {
        path: "/receptionist/dashboard",
        element: (
            <>
                <Helmet>
                    <title>Receptionist Dashboard | UTPALA</title>
                </Helmet>
                <Suspense fallback={
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                        <CircularProgress />
                    </Box>
                }>
                    <Receptionist_dashboard />
                </Suspense>
            </>
        ),
    },
    {
        path: "/receptionist/appointments",
        element: (
            <>
                <Helmet>
                    <title>Appointments | UTPALA</title>
                </Helmet>
                <Appointments_View />
            </>
        ),
    },
    {
        path: "/receptionist/inpatient",
        element: (
            <>
                <Helmet>
                    <title>Inpatients | UTPALA</title>
                </Helmet>
                <Inpatient_View />
            </>
        ),
    },
    {
        path: "/receptionist/outpatient",
        element: (
            <>
                <Helmet>
                    <title>Outpatients | UTPALA</title>
                </Helmet>
                <Outpatient_View />
            </>
        ),
    },
    {
        path: "/receptionist/inpatient-billing/:id",
        element: (
            <>
                <Helmet>
                    <title>Inpatient Billing | UTPALA</title>
                </Helmet>
                <InpatientBilling />
            </>
        ),
    },
    {
        path: "/receptionist/outpatient-billing/:patientId",
        element: (
            <>
                <Helmet>
                    <title>Outpatient Billing | UTPALA</title>
                </Helmet>
                <OutpatientBilling />
            </>
        ),
    },
    {
        path: "/receptionist/payments",
        element: (
            <>
                <Helmet>
                    <title>Payments | UTPALA</title>
                </Helmet>
                <Payments_View />
            </>
        ),
    },
    {
        path: "/receptionist/payments/invoice/:id",
        element: (
            <>
                <Helmet>
                    <title>Invoice Details | UTPALA</title>
                </Helmet>
                <InvoiceDetails />
            </>
        ),
    },
    {
        path: "/receptionist/marketing",
        element: (
            <>
                <Helmet>
                    <title>Marketing | UTPALA</title>
                </Helmet>
                <Suspense fallback={
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
                        <CircularProgress />
                    </Box>
                }>
                    <Marketing_View />
                </Suspense>
            </>
        ),
    },
    {
        path: "/receptionist/reports",
        element: (
            <>
                <Helmet>
                    <title>Reports | UTPALA</title>
                </Helmet>
                <Reports_View />
            </>
        ),
    },
    {
        path: "/receptionist/treatments",
        element: (
            <>
                <Helmet>
                    <title>Treatments | UTPALA</title>
                </Helmet>
                <Treatments_View />
            </>
        ),
    },
    {
        path: "/receptionist/treatments/therapy-details",
        element: (
            <>
                <Helmet>
                    <title>Patient Therapy Details | UTPALA</title>
                </Helmet>
                <PatientTherapyDetails />
            </>
        ),
    },
    // Modal pages
    {
        path: "/receptionist/payments/add",
        element: (
            <>
                <Helmet>
                    <title>Add Transaction | UTPALA</title>
                </Helmet>
                <AddEditTransactionPage />
            </>
        ),
    },
    {
        path: "/receptionist/payments/edit",
        element: (
            <>
                <Helmet>
                    <title>Edit Transaction | UTPALA</title>
                </Helmet>
                <AddEditTransactionPage />
            </>
        ),
    },
    {
        path: "/receptionist/payments/delete",
        element: (
            <>
                <Helmet>
                    <title>Delete Transaction | UTPALA</title>
                </Helmet>
                <DeleteTransactionPage />
            </>
        ),
    },
    {
        path: "/receptionist/inpatient/admit",
        element: (
            <>
                <Helmet>
                    <title>Admit Patient | UTPALA</title>
                </Helmet>
                <AdmitPatientPage />
            </>
        ),
    },
    {
        path: "/receptionist/inpatient/allocate",
        element: (
            <>
                <Helmet>
                    <title>Allocate Resources | UTPALA</title>
                </Helmet>
                <AllocateResourcesPage />
            </>
        ),
    },
    {
        path: "/receptionist/outpatient/allocate",
        element: (
            <>
                <Helmet>
                    <title>Allocate Nurse | UTPALA</title>
                </Helmet>
                <OutpatientAllocateResourcesPage />
            </>
        ),
    },
    {
        path: "/receptionist/appointments/add-patient",
        element: (
            <>
                <Helmet>
                    <title>Add Patient | UTPALA</title>
                </Helmet>
                <AddPatientPage />
            </>
        ),
    },
    {
        path: "/receptionist/appointments/schedule",
        element: (
            <>
                <Helmet>
                    <title>Schedule Appointment | UTPALA</title>
                </Helmet>
                <ScheduleAppointmentPage />
            </>
        ),
    },
    {
        path: "/receptionist/appointments/reschedule",
        element: (
            <>
                <Helmet>
                    <title>Reschedule Appointment | UTPALA</title>
                </Helmet>
                <RescheduleAppointmentPage />
            </>
        ),
    },
    {
        path: "/receptionist/appointments/view-patient",
        element: (
            <>
                <Helmet>
                    <title>View Patient | UTPALA</title>
                </Helmet>
                <ViewPatientPage />
            </>
        ),
    },
    {
        path: "/receptionist/appointments/whatsapp",
        element: (
            <>
                <Helmet>
                    <title>WhatsApp Message | UTPALA</title>
                </Helmet>
                <WhatsAppPage />
            </>
        ),
    },
    {
        path: "/receptionist/appointments/schedule-therapy",
        element: (
            <>
                <Helmet>
                    <title>Schedule Therapy | UTPALA</title>
                </Helmet>
                <ScheduleTherapyPage />
            </>
        ),
    },
    {
        path: "/receptionist/appointments/walk-in",
        element: (
            <>
                <Helmet>
                    <title>Walk-in Appointment | UTPALA</title>
                </Helmet>
                <WalkInAppointmentPage />
            </>
        ),
    },
    {
        path: "/receptionist/inpatient-billing/edit-charge",
        element: (
            <>
                <Helmet>
                    <title>Edit Charge | UTPALA</title>
                </Helmet>
                <EditChargePage />
            </>
        ),
    },
    {
        path: "/receptionist/swarna-bindu-events",
        element: (
            <>
                <Helmet>
                    <title>Swarna Bindu Events | UTPALA</title>
                </Helmet>
                <SwarnaBinduEvents_Calendar />
            </>
        ),
    },
    {
        path: "/receptionist/patient-history/:patientId",
        element: (
            <>
                <Helmet>
                    <title>Patient History | UTPALA</title>
                </Helmet>
                <PatientHistory />
            </>
        ),
    },
    {
        path: "/receptionist/walk-in-hub",
        element: (
            <>
                <Helmet>
                    <title>Walk-in Hub | UTPALA</title>
                </Helmet>
                <WalkInHub />
            </>
        ),
    },
];
