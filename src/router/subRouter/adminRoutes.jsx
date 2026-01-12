import React, { lazy, Suspense } from "react";
import { Helmet } from "react-helmet";
import Add_Doctors from "../../pages/admin/userTypes/Doctor/Add";
import Edit_Doctors from "../../pages/admin/userTypes/Doctor/Edit";
import View_Doctors from "../../pages/admin/userTypes/Doctor/View";
import Add_Nurs from "../../pages/admin/userTypes/Nurs/Add";
import Edit_Nurs from "../../pages/admin/userTypes/Nurs/Edit";
import View_Nurs from "../../pages/admin/userTypes/Nurs/View";
import Add_Receptionists from "../../pages/admin/userTypes/Receptionists/Add";
import Edit_Receptionists from "../../pages/admin/userTypes/Receptionists/Edit";
import View_Receptionists from "../../pages/admin/userTypes/Receptionists/View";
import Add_Pharmacists from "../../pages/admin/userTypes/Pharmacists/Add";
import Edit_Pharmacists from "../../pages/admin/userTypes/Pharmacists/Edit";
import View_Pharmacists from "../../pages/admin/userTypes/Pharmacists/View";
import View_Therapists from "../../pages/admin/userTypes/Therapists/View";
import Add_Therapists from "../../pages/admin/userTypes/Therapists/Add";
import Edit_Therapists from "../../pages/admin/userTypes/Therapists/Edit";
import Add_Patients from "../../pages/admin/userTypes/Patients/Add";
import Edit_Patients from "../../pages/admin/userTypes/Patients/Edit";
import View_Patients from "../../pages/admin/userTypes/Patients/View";
import Food_Charges_Edit from "../../pages/admin/Foodcharges/Edit";
import Food_Charges_Add from "../../pages/admin/Foodcharges/Add";
// src/routes/adminRoutes.jsx

// =================== PROFILE =====================
const AdminProfile = lazy(() => import("../../pages/admin/Profile"));

// ================= ADMIN MAIN PAGES =================
const Dashboard = lazy(() => import("../../pages/admin/Dashboard"));
const Doctors = lazy(() => import("../../pages/admin/Doctors"));
import Nursing from "../../pages/admin/Nursing";
const Receptionists = lazy(() => import("../../pages/admin/Receptionists"));
const Pharmacists = lazy(() => import("../../pages/admin/Pharmacists"));
const Therapists = lazy(() => import("../../pages/admin/Therapists"));
const Patients = lazy(() => import("../../pages/admin/Patients"));

// ================= CONSULTATION =================
const Slot_View = lazy(() =>
    import("../../pages/admin/Consultation/slot/View")
);
const Slot_Add = lazy(() =>
    import("../../pages/admin/Consultation/slot/Add")
);
const Slot_Edit = lazy(() =>
    import("../../pages/admin/Consultation/slot/Edit")
);
// ===============
const Consultation_View = lazy(() =>
    import("../../pages/admin/Consultation/DoctorConsultation/View")
);
const Consultation_add = lazy(() =>
    import("../../pages/admin/Consultation/DoctorConsultation/Add")
);
const Consultation_edit = lazy(() =>
    import("../../pages/admin/Consultation/DoctorConsultation/Edit")
);

// ================= THERAPISTS =================
const TherapyManagement = lazy(() =>
    import("../../pages/admin/TreatmentTherapists/Therapists/Details")
);
const TherapyManagement_View = lazy(() =>
    import("../../pages/admin/TreatmentTherapists/Therapists/View")
);
const TherapyManagement_Add = lazy(() =>
    import("../../pages/admin/TreatmentTherapists/Therapists/Add")
);
const TherapyManagement_Edit = lazy(() =>
    import("../../pages/admin/TreatmentTherapists/Therapists/Edit")
);
// ======
const Therapists_Assignment_View = lazy(() =>
    import("../../pages/admin/TreatmentTherapists/TherapistsAssignment/View")
);
const Therapists_Assignment_Add = lazy(() =>
    import("../../pages/admin/TreatmentTherapists/TherapistsAssignment/Add")
);
const Therapists_Assignment_Edit = lazy(() =>
    import("../../pages/admin/TreatmentTherapists/TherapistsAssignment/Edit")
);

// ================= INVENTORY =================
const Inventory_View = lazy(() =>
    import("../../pages/admin/inventory/View")
);
const Inventory_Details = lazy(() =>
    import("../../pages/admin/inventory/Details")
);
const Inventory_Add = lazy(() =>
    import("../../pages/admin/inventory/Add")
);
const Inventory_Edit = lazy(() =>
    import("../../pages/admin/inventory/Edit")
);
const Batch_Log_View = lazy(() =>
    import("../../pages/admin/inventory/BatchLog")
);
const Batch_Log_Edit = lazy(() =>
    import("../../pages/admin/inventory/Batch_Log_Edit")
);
const Batch_Log_Add = lazy(() =>
    import("../../pages/admin/inventory/Batch_Log_Add")
);
const BatchLogViewPage = lazy(() =>
    import("../../pages/admin/inventory/BatchLogView")
);
const BatchLogDetailsPage = lazy(() =>
    import("../../pages/admin/inventory/BatchLogDetails")
);

// ================= FOOD CHARGES =================
const Food_Charges_View = lazy(() =>
    import("../../pages/admin/Foodcharges/View")
);

// ================= WARD CHARGES =================
const Ward_Charges_View = lazy(() =>
    import("../../pages/admin/Wardcharges/View")
);
const Ward_Charges_Add = lazy(() =>
    import("../../pages/admin/Wardcharges/Add")
);
const Ward_Charges_Edit = lazy(() =>
    import("../../pages/admin/Wardcharges/Edit")
);

// ================= ANALYTICS =================
const Admissions_View = lazy(() =>
    import("../../pages/admin/analytics/Admissions")
);

const Discharges = lazy(() =>
    import("../../pages/admin/analytics/Discharges")
);

const PatientRecords = lazy(() =>
    import("../../pages/admin/analytics/PatientRecords")
);

// ================= SWARNA BINDU EVENTS =================
const SwarnaBinduEvents_View = lazy(() =>
    import("../../pages/admin/SwarnaBinduEvents/View")
);
const SwarnaBinduEvents_Add = lazy(() =>
    import("../../pages/admin/SwarnaBinduEvents/Add")
);
const SwarnaBinduEvents_Edit = lazy(() =>
    import("../../pages/admin/SwarnaBinduEvents/Edit")
);

// Stock List======================================

export const adminRoutes = [
    // Profile ========================================
    {
        path: "/admin/profile", element:
            <><Helmet>
                <title>Profile | UTPALA</title>
                <meta name="description" content="Admin profile overview." />
            </Helmet>
                <AdminProfile />
            </>
    },

    // =================================dashboard ======================

    {
        path: "/admin/dashboard", element:
            <><Helmet>
                <title>Dashboard | UTPALA</title>
                <meta name="description" content="Doctor dashboard overview." />
            </Helmet>
                <Dashboard />
            </>
    },

    // ===================== Doctor ================================

    {
        path: "/admin/doctors", element:
            <><Helmet>
                <title>Doctors | UTPALA</title>
                <meta name="description" content="Doctor dashboard overview." />
            </Helmet>
                <Doctors />
            </>
    },
    {
        path: "/admin/doctors/view/:doctorId", element:
            <><Helmet>
                <title>Doctors Details| UTPALA</title>
                <meta name="description" content="Doctor dashboard overview." />
            </Helmet>
                <View_Doctors />
            </>
    },
    {
        path: "/admin/doctors/add", element:
            <><Helmet>
                <title>Create Doctors | UTPALA</title>
                <meta name="description" content="Doctor dashboard overview." />
            </Helmet>
                <Add_Doctors />
            </>
    },
    {
        path: "/admin/doctors/edit/:doctorId", element:
            <><Helmet>
                <title>Edit Doctors | UTPALA</title>
                <meta name="description" content="Doctor dashboard overview." />
            </Helmet>
                <Edit_Doctors />
            </>
    },

    // ============================ nurse ================================

    {
        path: "/admin/nursing", element:
            <><Helmet>
                <title>Nursing | UTPALA</title>
                <meta name="description" content="Nursing dashboard overview." />
            </Helmet>
                <Nursing />
            </>
    },
    {
        path: "/admin/nursing/view/:nurseId", element:
            <><Helmet>
                <title>Nursing Details | UTPALA</title>
                <meta name="description" content="Nursing dashboard overview." />
            </Helmet>
                <View_Nurs />
            </>
    },
    {
        path: "/admin/nursing/add", element:
            <><Helmet>
                <title>Create Nursing | UTPALA</title>
                <meta name="description" content="Nursing dashboard overview." />
            </Helmet>
                <Add_Nurs />
            </>
    },
    {
        path: "/admin/nursing/edit/:nurseId", element:
            <><Helmet>
                <title>Edit Nursing | UTPALA</title>
                <meta name="description" content="Nursing dashboard overview." />
            </Helmet>
                <Edit_Nurs />
            </>
    },
    // =========================== receptionists ==================================
    {
        path: "/admin/receptionists", element:
            <><Helmet>
                <title>Receptionists | UTPALA</title>
                <meta name="description" content="Receptionists dashboard overview." />
            </Helmet>
                <Receptionists />
            </>
    },
    {
        path: "/admin/receptionists/view/:receptionistId", element:
            <><Helmet>
                <title>Receptionists Details | UTPALA</title>
                <meta name="description" content="receptionists dashboard overview." />
            </Helmet>
                <View_Receptionists />
            </>
    },
    {
        path: "/admin/receptionists/add", element:
            <><Helmet>
                <title>Create Receptionists | UTPALA</title>
                <meta name="description" content="receptionists dashboard overview." />
            </Helmet>
                <Add_Receptionists />
            </>
    },
    {
        path: "/admin/receptionists/edit/:receptionistId", element:
            <><Helmet>
                <title>Edit Receptionists | UTPALA</title>
                <meta name="description" content="receptionists dashboard overview." />
            </Helmet>
                <Edit_Receptionists />
            </>
    },
    // =========================== pharmacists ==================================
    {
        path: "/admin/pharmacists", element:
            <><Helmet>
                <title>Pharmacists | UTPALA</title>
                <meta name="description" content="Pharmacists dashboard overview." />
            </Helmet>
                <Pharmacists />
            </>
    },
    {
        path: "/admin/pharmacists/view/:pharmacistId", element:
            <><Helmet>
                <title>Pharmacists Details | UTPALA</title>
                <meta name="description" content="Pharmacists dashboard overview." />
            </Helmet>
                <View_Pharmacists />
            </>
    },
    {
        path: "/admin/pharmacists/add", element:
            <><Helmet>
                <title>Create Pharmacists | UTPALA</title>
                <meta name="description" content="pharmacists dashboard overview." />
            </Helmet>
                <Add_Pharmacists />
            </>
    },
    {
        path: "/admin/pharmacists/edit/:pharmacistId", element:
            <><Helmet>
                <title>Edit Pharmacists | UTPALA</title>
                <meta name="description" content="pharmacists dashboard overview." />
            </Helmet>
                <Edit_Pharmacists />
            </>
    },
    // =========================== Therapists ==================================
    {
        path: "/admin/therapists", element:
            <><Helmet>
                <title>Therapists | UTPALA</title>
                <meta name="description" content="Therapists dashboard overview." />
            </Helmet>
                <Therapists />
            </>
    },
    {
        path: "/admin/therapists/view/:therapistsId", element:
            <><Helmet>
                <title>Therapists Details | UTPALA</title>
                <meta name="Tescription" content="Therapists dashboard overview." />
            </Helmet>
                <View_Therapists />
            </>
    },
    {
        path: "/admin/therapists/add", element:
            <><Helmet>
                <title>Create Therapists | UTPALA</title>
                <meta name="description" content="Therapists dashboard overview." />
            </Helmet>
                <Add_Therapists />
            </>
    },
    {
        path: "/admin/therapists/edit/:therapistsId", element:
            <><Helmet>
                <title>Edit Therapists | UTPALA</title>
                <meta name="description" content="Therapists dashboard overview." />
            </Helmet>
                <Edit_Therapists />
            </>
    },
    // =========================== patients ==================================
    {
        path: "/admin/patients", element:
            <><Helmet>
                <title>Patients | UTPALA</title>
                <meta name="description" content="Patients dashboard overview." />
            </Helmet>
                <Patients />
            </>
    },
    {
        path: "/admin/patients/view/:patientId", element:
            <><Helmet>
                <title>Patients Details | UTPALA</title>
                <meta name="Tescription" content="Patients dashboard overview." />
            </Helmet>
                <View_Patients />
            </>
    },
    {
        path: "/admin/patients/add", element:
            <><Helmet>
                <title>Create Patients | UTPALA</title>
                <meta name="description" content="Patients dashboard overview." />
            </Helmet>
                <Add_Patients />
            </>
    },
    {
        path: "/admin/patients/edit/:patientId", element:
            <><Helmet>
                <title>Edit Patients | UTPALA</title>
                <meta name="description" content="Patients dashboard overview." />
            </Helmet>
                <Edit_Patients />
            </>
    },
    // Treatment Therapists =================================
    // =====================================
    {
        path: "/admin/treatment-therapy", element:
            <><Helmet>
                <title>Therapist | UTPALA</title>
                <meta name="description" content="Patients dashboard overview." />
            </Helmet>
                <TherapyManagement />
            </>
    },
    {
        path: "/admin/treatment-therapy/view/:therapyId", element:
            <><Helmet>
                <title>Therapist Details | UTPALA</title>
                <meta name="Tescription" content="Therapist dashboard overview." />
            </Helmet>
                <TherapyManagement_View />
            </>
    },
    {
        path: "/admin/treatment-therapy/add", element:
            <><Helmet>
                <title>Create Therapist | UTPALA</title>
                <meta name="description" content="Therapist dashboard overview." />
            </Helmet>
                <TherapyManagement_Add />
            </>
    },
    {
        path: "/admin/treatment-therapy/edit/:therapyId", element:
            <><Helmet>
                <title>Edit Therapist | UTPALA</title>
                <meta name="description" content="Therapist dashboard overview." />
            </Helmet>
                <TherapyManagement_Edit />
            </>
    },
    // =========================================
    {
        path: "/admin/treatment-assignments", element:

            <><Helmet>
                <title>Therapist Assignments | UTPALA</title>
                <meta name="description" content="Therapist assignments overview." />
            </Helmet>
                <Therapists_Assignment_View />
            </>
    },
    {
        path: "/admin/treatment-assignments/view/:nurseId", element:
            <><Helmet>
                <title>Assignments Details | UTPALA</title>
                <meta name="Tescription" content="Therapist assignments dashboard overview." />
            </Helmet>
                <Therapists_Assignment_View />
            </>
    },
    {
        path: "/admin/treatment-assignments/add", element:
            <><Helmet>
                <title>Create Therapist | UTPALA</title>
                <meta name="assignments" content="Therapist assignments dashboard overview." />
            </Helmet>
                <Therapists_Assignment_Add />
            </>
    },
    {
        path: "/admin/treatment-assignments/edit/:nurseId", element:
            <><Helmet>
                <title>Edit Therapist | UTPALA</title>
                <meta name="assignments" content="Assignments dashboard overview." />
            </Helmet>
                <Therapists_Assignment_Edit />
            </>
    },
    // ================================
    // Consultation =========================================
    // ===== slot ===============
    {
        path: "/admin/consultation/slot/view",
        element: (
            <>
                <Helmet>
                    <title>Consultation Slots | UTPALA</title>
                    <meta
                        name="description"
                        content="View and manage consultation slots in the UTPALA admin panel."
                    />
                </Helmet>
                <Slot_View />
            </>
        ),
    },

    {
        path: "/admin/consultation/slots/add",
        element: (
            <>
                <Helmet>
                    <title>Add Consultation Slot | UTPALA</title>
                    <meta
                        name="description"
                        content="Create a new consultation slot in the UTPALA system."
                    />
                </Helmet>
                <Slot_Add />
            </>
        ),
    },

    {
        path: "/admin/consultation/slots/edit/:slotId",
        element: (
            <>
                <Helmet>
                    <title>Edit Consultation Slot | UTPALA</title>
                    <meta
                        name="description"
                        content="Edit an existing consultation slot in the UTPALA admin panel."
                    />
                </Helmet>
                <Slot_Edit />
            </>
        ),
    },

    // {path : "/consultation/add" ,}

    // ===== consultation ===============
    {
        path: "/admin/consultation/view",
        element: (
            <>
                <Helmet>
                    <title>Consultation Fees | UTPALA</title>
                    <meta name="description" content="Consultation fees overview." />
                </Helmet>
                <Consultation_View />
            </>
        ),
    },
    {
        path: "/admin/consultation/fees/add",
        element: (
            <>
                <Helmet>
                    <title>Add Consultation Fee | UTPALA</title>
                    <meta name="description" content="Add consultation fee." />
                </Helmet>
                <Consultation_add />
            </>
        ),
    },
    {
        path: "/admin/consultation/fees/edit/:id",
        element: (
            <>
                <Helmet>
                    <title>Edit Consultation Fee | UTPALA</title>
                    <meta name="description" content="Edit consultation fee." />
                </Helmet>
                <Consultation_edit />
            </>
        ),
    },


    // Stock List =====================
    {
        path: "/admin/inventory/view", element:

            <><Helmet>
                <title>Inventory | UTPALA</title>
                <meta name="description" content="Inventory overview." />
            </Helmet>
                <Inventory_View /></>
    },
    {
        path: "/admin/inventory/view/:id",
        element: (
            <>
                <Helmet>
                    <title>Inventory Details | UTPALA</title>
                    <meta name="description" content="View detailed inventory information for a medicine." />
                </Helmet>
                <Inventory_Details />
            </>
        ),
    },
    {
        path: "/admin/inventory/add",
        element: (
            <>
                <Helmet>
                    <title>Add Inventory | UTPALA</title>
                </Helmet>
                <Inventory_Add />
            </>
        ),
    },
    {
        path: "/admin/inventory/edit/:id",
        element: (
            <>
                <Helmet>
                    <title>Edit Inventory | UTPALA</title>
                </Helmet>
                <Inventory_Edit />
            </>
        ),
    },

    // ==============================
    {
        path: "/admin/inventory/batch-log/:stockId", element:

            <><Helmet>
                <title>Batch Log | UTPALA</title>
                <meta name="description" content="Batch log overview." />
            </Helmet>
                <Batch_Log_View /></>
    },
    {
        path: "/admin/inventory/batch-log",
        element: (
            <>
                <Helmet>
                    <title>Batch Log View | UTPALA</title>
                    <meta name="description" content="View batch log details for inventory items." />
                </Helmet>
                <BatchLogViewPage />
            </>
        ),
    },
    {
        path: "/admin/inventory/batch-log-details",
        element: (
            <>
                <Helmet>
                    <title>Batch Log Details | UTPALA</title>
                    <meta name="description" content="View detailed batch log information." />
                </Helmet>
                <BatchLogDetailsPage />
            </>
        ),
    },
    {
        path: "/admin/inventory/batch-log/add", element:

            <><Helmet>
                <title>Batch Log | UTPALA</title>
                <meta name="description" content="Batch log overview." />
            </Helmet>
                <Batch_Log_Add /></>
    },
    {
        path: "/admin/inventory/batch-log/edit/:id", element:

            <><Helmet>
                <title>Batch Log | UTPALA</title>
                <meta name="description" content="Batch log overview." />
            </Helmet>
                <Batch_Log_Edit /></>
    },

    // Food Charges ===================  ==========================
    {
        path: "/admin/foodcharges/view", element:

            <><Helmet>
                <title>Food Charges | UTPALA</title>
                <meta name="description" content="Food charges overview." />
            </Helmet>
                <Food_Charges_View /></>
    },
    // {
    //     path: "/admin/food-charges",
    //     element: (
    //         <>
    //             <Helmet>
    //                 <title>Food Charges | UTPALA</title>
    //                 <meta
    //                     name="description"
    //                     content="View and manage all food charges in the UTPALA admin panel."
    //                 />
    //             </Helmet>
    //             <Food_Charges_View />
    //         </>
    //     ),
    // },

    {
        path: "/admin/food-charges/add",
        element: (
            <>
                <Helmet>
                    <title>Add Food Charges | UTPALA</title>
                    <meta
                        name="description"
                        content="Add new food charges details in the UTPALA system."
                    />
                </Helmet>
                <Food_Charges_Add />
            </>
        ),
    },

    {
        path: "/admin/food-charges/edit/:id",
        element: (
            <>
                <Helmet>
                    <title>Edit Food Charges | UTPALA</title>
                    <meta
                        name="description"
                        content="Edit existing food charges information in the UTPALA admin panel."
                    />
                </Helmet>
                <Food_Charges_Edit />
            </>
        ),
    },

    // Ward Charges ===================  ==========================
    {
        path: "/admin/ward-charges/view", element:
            <><Helmet>
                <title>Ward Charges | UTPALA</title>
                <meta name="description" content="Ward charges overview." />
            </Helmet>
                <Ward_Charges_View /></>
    },
    {
        path: "/admin/ward-charges/add",
        element: (
            <>
                <Helmet>
                    <title>Add Ward Charges | UTPALA</title>
                    <meta
                        name="description"
                        content="Add new ward charges details in the UTPALA system."
                    />
                </Helmet>
                <Ward_Charges_Add />
            </>
        ),
    },
    {
        path: "/admin/ward-charges/edit/:id",
        element: (
            <>
                <Helmet>
                    <title>Edit Ward Charges | UTPALA</title>
                    <meta
                        name="description"
                        content="Edit existing ward charges information in the UTPALA admin panel."
                    />
                </Helmet>
                <Ward_Charges_Edit />
            </>
        ),
    },

    // analytics =============================
    {
        path: "/admin/analytics/admissions", element:

            <><Helmet>
                <title>Admissions | UTPALA</title>
                <meta name="description" content="Admissions overview." />
            </Helmet>
                <Admissions_View /></>
    },
    {
        path: "/admin/analytics/discharges", element:
            <><Helmet>
                <title>Discharges | UTPALA</title>
                <meta name="description" content="Discharges overview." />
            </Helmet>
                <Discharges /></>
    },
    {
        path: "/admin/analytics/patient-records", element:
            <><Helmet>
                <title>Patient Records | UTPALA</title>
                <meta name="description" content="Patient records overview." />
            </Helmet>
                <PatientRecords /></>
    },

    // ================= SWARNA BINDU EVENTS =================
    {
        path: "/admin/swarna-bindu-events/view", element:
            <><Helmet>
                <title>Swarna Bindu Events | UTPALA</title>
                <meta name="description" content="Manage Swarna Bindu events." />
            </Helmet>
                <SwarnaBinduEvents_View /></>
    },
    {
        path: "/admin/swarna-bindu-events/add", element:
            <><Helmet>
                <title>Add Swarna Bindu Event | UTPALA</title>
                <meta name="description" content="Create a new Swarna Bindu event." />
            </Helmet>
                <SwarnaBinduEvents_Add /></>
    },
    {
        path: "/admin/swarna-bindu-events/edit/:id", element:
            <><Helmet>
                <title>Edit Swarna Bindu Event | UTPALA</title>
                <meta name="description" content="Edit Swarna Bindu event details." />
            </Helmet>
                <SwarnaBinduEvents_Edit /></>
    },

];
