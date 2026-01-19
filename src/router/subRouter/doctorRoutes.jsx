// src/router/subRouter/doctorRoutes.jsx

import { lazy } from "react";
import { Helmet } from "react-helmet";

const Doctor_Dashboard = lazy(() =>
    import("../../pages/doctor/Dashboard")
);
const Doctor_Profile = lazy(() =>
    import("../../pages/doctor/Profile")
);
const PatientExamination = lazy(() =>
    import("../../pages/doctor/Patients/PatientExamination")
);
const ExaminationDetails = lazy(() =>
    import("../../pages/doctor/Patients/ExaminationDetails")
);
const EditExamination = lazy(() =>
    import("../../pages/doctor/Patients/EditExamination")
);
const PatientFollowUpsCalendar = lazy(() =>
    import("../../pages/doctor/FollowUps/PatientFollowUpsCalendar")
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
const PatientDetails = lazy(() =>
    import("../../pages/doctor/PatientManagement/PatientDetails")
);
const AddPrescriptionPage = lazy(() =>
    import("../../pages/doctor/PatientManagement/AddPrescription")
);
const AddDailyCheckupPage = lazy(() =>
    import("../../pages/doctor/PatientManagement/AddDailyCheckup")
);
const AddTherapyPlanPage = lazy(() =>
    import("../../pages/doctor/PatientManagement/AddTherapyPlan")
);
const OPConsultation_View = lazy(() =>
    import("../../pages/doctor/OPConsultation/View")
);
const AssignTherapy_View = lazy(() =>
    import("../../pages/doctor/AssignTherapy/View")
);
const AssignTherapy_Add = lazy(() =>
    import("../../pages/doctor/AssignTherapy/Add")
);
const AssignTherapy_Details = lazy(() =>
    import("../../pages/doctor/AssignTherapy/Details")
);
const Prescriptions_View = lazy(() =>
    import("../../pages/doctor/Prescriptions/View")
);
const Prescriptions_Add = lazy(() =>
    import("../../pages/doctor/Prescriptions/Add")
);
const Prescriptions_Details = lazy(() =>
    import("../../pages/doctor/Prescriptions/Details")
);
const OPDTherapies_View = lazy(() =>
    import("../../pages/doctor/OPDTherapies/View")
);
const OPDTherapies_Add = lazy(() =>
    import("../../pages/doctor/OPDTherapies/Add")
);
const OPDTherapies_Details = lazy(() =>
    import("../../pages/doctor/OPDTherapies/Details")
);
const IPDPrescriptions_View = lazy(() =>
    import("../../pages/doctor/IPDPrescriptions/View")
);
const IPDPrescriptions_Add = lazy(() =>
    import("../../pages/doctor/IPDPrescriptions/Add")
);
const IPDPrescriptions_Details = lazy(() =>
    import("../../pages/doctor/IPDPrescriptions/Details")
);
const FollowUps_View = lazy(() =>
    import("../../pages/doctor/FollowUps/View")
);
const ProgressTracker = lazy(() =>
    import("../../pages/doctor/TherapyProgress/ProgressTracker")
);

export {
    Doctor_Dashboard,
    All_Patients_View,
    Patient_Management_View
};


export const doctorRoutes = [
    // Doctor Module
    {
        path: "/doctor/dashboard",
        element: (
            <>
                <Helmet>
                    <title>Doctor Dashboard | UTPALA</title>
                    <meta
                        name="description"
                        content="Overview of doctor dashboard including appointments, patients, and activities."
                    />
                </Helmet>
                <Doctor_Dashboard />
            </>
        ),
    },
    {
        path: "/doctor/profile",
        element: (
            <>
                <Helmet>
                    <title>Doctor Profile | UTPALA</title>
                    <meta
                        name="description"
                        content="View and manage doctor profile details."
                    />
                </Helmet>
                <Doctor_Profile />
            </>
        ),
    },
    {
        path: "/doctor/my-patients",
        element: (
            <>
                <Helmet>
                    <title>My Patients | UTPALA</title>
                    <meta
                        name="description"
                        content="View and manage all assigned patients."
                    />
                </Helmet>
                <All_Patients_View />
            </>
        ),
    },
    {
        path: "/doctor/family-members/:userId",
        element: (
            <>
                <Helmet>
                    <title>Patient Family Members | UTPALA</title>
                    <meta
                        name="description"
                        content="View family members linked to the selected patient."
                    />
                </Helmet>
                <FamilyMembers />
            </>
        ),
    },
    {
        path: "/doctor/examination/:userId",
        element: (
            <>
                <Helmet>
                    <title>Patient Follow-up Calendar | UTPALA</title>
                    <meta
                        name="description"
                        content="View and manage follow-up appointments for the selected patient."
                    />
                </Helmet>
                <PatientFollowUpsCalendar />
            </>
        ),
    },
    {
        path: "/doctor/add-examination/:userId",
        element: (
            <>
                <Helmet>
                    <title>Add Examination Record | UTPALA</title>
                    <meta
                        name="description"
                        content="View and manage examination records for the selected patient."
                    />
                </Helmet>
                <PatientExamination />
            </>
        ),
    },
    {
        path: "/doctor/examination-details/:examinationId",
        element: (
            <>
                <Helmet>
                    <title>Examination Details | UTPALA</title>
                    <meta
                        name="description"
                        content="View detailed examination record for the patient."
                    />
                </Helmet>
                <ExaminationDetails />
            </>
        ),
    },
    {
        path: "/doctor/edit-examination/:userId",
        element: (
            <>
                <Helmet>
                    <title>Edit Examination | UTPALA</title>
                    <meta
                        name="description"
                        content="Edit examination record for the patient."
                    />
                </Helmet>
                <EditExamination />
            </>
        ),
    },
    {
        path: "/doctor/examination/priviousDetails/:userId",
        element: (
            <>
                <Helmet>
                    <title>Patient Examination | UTPALA</title>
                    <meta
                        name="description"
                        content="View and manage examination records for the selected patient."
                    />
                </Helmet>
                <PatientExamination />
            </>
        ),
    },
    // ====================================
    {
        path: "/doctor/in-patients",
        element: (
            <>
                <Helmet>
                    <title>In-Patients | UTPALA</title>
                    <meta
                        name="description"
                        content="Manage and monitor in-patient records."
                    />
                </Helmet>
                <Patient_Management_View />
            </>
        ),
    },
    {
        path: "/doctor/in-patients/:patientId",
        element: (
            <>
                <Helmet>
                    <title>In-Patient Details | UTPALA</title>
                    <meta
                        name="description"
                        content="View detailed information of the selected in-patient."
                    />
                </Helmet>
                <PatientDetails />
            </>
        ),
    },
    {
        path: "/doctor/in-patients/add-prescription",
        element: (
            <>
                <Helmet>
                    <title>Add Prescription | UTPALA</title>
                    <meta
                        name="description"
                        content="Add prescription for patient."
                    />
                </Helmet>
                <AddPrescriptionPage />
            </>
        ),
    },
    {
        path: "/doctor/in-patients/add-daily-checkup",
        element: (
            <>
                <Helmet>
                    <title>Add Daily Checkup | UTPALA</title>
                    <meta
                        name="description"
                        content="Add daily checkup for patient."
                    />
                </Helmet>
                <AddDailyCheckupPage />
            </>
        ),
    },
    {
        path: "/doctor/in-patients/add-therapy-plan",
        element: (
            <>
                <Helmet>
                    <title>Add Therapy Plan | UTPALA</title>
                    <meta
                        name="description"
                        content="Add therapy plan for patient."
                    />
                </Helmet>
                <AddTherapyPlanPage />
            </>
        ),
    },
    {
        path: "/doctor/op-consultation",
        element: (
            <>
                <Helmet>
                    <title>OP Consultation | UTPALA</title>
                    <meta
                        name="description"
                        content="Manage outpatient consultations and appointments."
                    />
                </Helmet>
                <OPConsultation_View />
            </>
        ),
    },
    {
        path: "/doctor/assign-therapy",
        element: (
            <>
                <Helmet>
                    <title>IPD Therapies | UTPALA</title>
                    <meta
                        name="description"
                        content="Manage IPD therapy assignments for inpatients."
                    />
                </Helmet>
                <AssignTherapy_View />
            </>
        ),
    },
    {
        path: "/doctor/assign-therapy/new",
        element: (
            <>
                <Helmet>
                    <title>Assign New IPD Therapy | UTPALA</title>
                    <meta
                        name="description"
                        content="Assign a new IPD therapy to an inpatient."
                    />
                </Helmet>
                <AssignTherapy_Add />
            </>
        ),
    },
    {
        path: "/doctor/assign-therapy/:id",
        element: (
            <>
                <Helmet>
                    <title>IPD Therapy Plan Details | UTPALA</title>
                    <meta
                        name="description"
                        content="View detailed IPD therapy plan information."
                    />
                </Helmet>
                <AssignTherapy_Details />
            </>
        ),
    },
    {
        path: "/doctor/assign-therapy/edit/:id",
        element: (
            <>
                <Helmet>
                    <title>Edit IPD Therapy Plan | UTPALA</title>
                    <meta
                        name="description"
                        content="Edit IPD therapy plan for an inpatient."
                    />
                </Helmet>
                <AssignTherapy_Add />
            </>
        ),
    },
    {
        path: "/doctor/prescriptions",
        element: (
            <>
                <Helmet>
                    <title>Prescriptions | UTPALA</title>
                    <meta
                        name="description"
                        content="Manage and view patient prescriptions."
                    />
                </Helmet>
                <Prescriptions_View />
            </>
        ),
    },
    {
        path: "/doctor/prescriptions/new",
        element: (
            <>
                <Helmet>
                    <title>Create Prescription | UTPALA</title>
                    <meta
                        name="description"
                        content="Create a new prescription for a patient."
                    />
                </Helmet>
                <Prescriptions_Add />
            </>
        ),
    },
    {
        path: "/doctor/prescriptions/:id",
        element: (
            <>
                <Helmet>
                    <title>Prescription Details | UTPALA</title>
                    <meta
                        name="description"
                        content="View detailed prescription information."
                    />
                </Helmet>
                <Prescriptions_Details />
            </>
        ),
    },
    {
        path: "/doctor/prescriptions/edit/:id",
        element: (
            <>
                <Helmet>
                    <title>Edit Prescription | UTPALA</title>
                    <meta
                        name="description"
                        content="Edit prescription information."
                    />
                </Helmet>
                <Prescriptions_Add />
            </>
        ),
    },
    {
        path: "/doctor/opd-therapies",
        element: (
            <>
                <Helmet>
                    <title>OPD Therapies | UTPALA</title>
                    <meta
                        name="description"
                        content="Manage and view OPD patient therapy plans."
                    />
                </Helmet>
                <OPDTherapies_View />
            </>
        ),
    },
    {
        path: "/doctor/opd-therapies/new",
        element: (
            <>
                <Helmet>
                    <title>Add OPD Therapy Plan | UTPALA</title>
                    <meta
                        name="description"
                        content="Create a new OPD therapy plan for a patient."
                    />
                </Helmet>
                <OPDTherapies_Add />
            </>
        ),
    },
    {
        path: "/doctor/opd-therapies/edit/:id",
        element: (
            <>
                <Helmet>
                    <title>Edit OPD Therapy Plan | UTPALA</title>
                    <meta
                        name="description"
                        content="Edit OPD therapy plan for a patient."
                    />
                </Helmet>
                <OPDTherapies_Add />
            </>
        ),
    },
    {
        path: "/doctor/opd-therapies/:id",
        element: (
            <>
                <Helmet>
                    <title>OPD Therapy Plan Details | UTPALA</title>
                    <meta
                        name="description"
                        content="View detailed OPD therapy plan information."
                    />
                </Helmet>
                <OPDTherapies_Details />
            </>
        ),
    },
    {
        path: "/doctor/ipd-prescriptions",
        element: (
            <>
                <Helmet>
                    <title>IPD Prescriptions | UTPALA</title>
                    <meta
                        name="description"
                        content="Manage and view IPD patient prescriptions."
                    />
                </Helmet>
                <IPDPrescriptions_View />
            </>
        ),
    },
    {
        path: "/doctor/ipd-prescriptions/new",
        element: (
            <>
                <Helmet>
                    <title>Create IPD Prescription | UTPALA</title>
                    <meta
                        name="description"
                        content="Create a new IPD prescription for an inpatient."
                    />
                </Helmet>
                <IPDPrescriptions_Add />
            </>
        ),
    },
    {
        path: "/doctor/ipd-prescriptions/:id",
        element: (
            <>
                <Helmet>
                    <title>IPD Prescription Details | UTPALA</title>
                    <meta
                        name="description"
                        content="View detailed IPD prescription information."
                    />
                </Helmet>
                <IPDPrescriptions_Details />
            </>
        ),
    },
    {
        path: "/doctor/ipd-prescriptions/edit/:id",
        element: (
            <>
                <Helmet>
                    <title>Edit IPD Prescription | UTPALA</title>
                    <meta
                        name="description"
                        content="Edit IPD prescription information."
                    />
                </Helmet>
                <IPDPrescriptions_Add />
            </>
        ),
    },
    {
        path: "/doctor/follow-ups",
        element: (
            <>
                <Helmet>
                    <title>Follow-ups | UTPALA</title>
                    <meta
                        name="description"
                        content="Manage and track patient follow-up appointments."
                    />
                </Helmet>
                <FollowUps_View />
            </>
        ),
    },
    {
        path: "/doctor/therapy-execution/:sessionId",
        element: (
            <>
                <Helmet>
                    <title>Therapy Progress | UTPALA</title>
                    <meta
                        name="description"
                        content="Track therapy progress and execution."
                    />
                </Helmet>
                <ProgressTracker />
            </>
        ),
    },
];
