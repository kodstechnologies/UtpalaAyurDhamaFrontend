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
const Prescriptions_View = lazy(() =>
    import("../../pages/doctor/Prescriptions/View")
);
const Prescriptions_Add = lazy(() =>
    import("../../pages/doctor/Prescriptions/Add")
);
const Prescriptions_Details = lazy(() =>
    import("../../pages/doctor/Prescriptions/Details")
);
const FollowUps_View = lazy(() =>
    import("../../pages/doctor/FollowUps/View")
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
                    <title>Assign Therapy | UTPALA</title>
                    <meta
                        name="description"
                        content="Manage therapy assignments for patients."
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
                    <title>Assign New Therapy | UTPALA</title>
                    <meta
                        name="description"
                        content="Assign a new therapy to a patient."
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

];
