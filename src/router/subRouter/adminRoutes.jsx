import React, { lazy } from "react";
import { Helmet } from "react-helmet";
// src/routes/adminRoutes.jsx

// =================== PROFILE =====================
const AdminProfile = lazy(() => import("../../pages/admin/Profile"));

// ================= ADMIN MAIN PAGES =================
const Dashboard = lazy(() => import("../../pages/admin/dashboard"));
const Doctors = lazy(() => import("../../pages/admin/Doctors"));
const Nursing = lazy(() => import("../../pages/admin/Nursing"));
const Receptionists = lazy(() => import("../../pages/admin/Receptionists"));
const Pharmacists = lazy(() => import("../../pages/admin/Pharmacists"));
const Therapists = lazy(() => import("../../pages/admin/Therapists"));
const Patients = lazy(() => import("../../pages/admin/Patients"));

// ================= CONSULTATION =================
const Slot_View = lazy(() =>
    import("../../pages/admin/Consultation/slot/View")
);

const Consultation_View = lazy(() =>
    import("../../pages/admin/Consultation/DoctorConsultation/View")
);

// ================= THERAPISTS =================
const Therapists_View = lazy(() =>
    import("../../pages/admin/TreatmentTherapists/Therapists/View")
);

const Therapists_Assignment_View = lazy(() =>
    import("../../pages/admin/TreatmentTherapists/TherapistsAssignment/View")
);

// ================= INVENTORY =================
const Inventory_View = lazy(() =>
    import("../../pages/admin/inventory/View")
);
const Batch_Log_View = lazy(() =>
    import("../../pages/admin/inventory/BatchLog")
);

// ================= FOOD CHARGES =================
const Food_Charges_View = lazy(() =>
    import("../../pages/admin/Foodcharges/View")
);

// ================= ANALYTICS =================
const Admissions_View = lazy(() =>
    import("../../pages/admin/analytics/admissions")
);

const Discharges = lazy(() =>
    import("../../pages/admin/analytics/Discharges")
);

const PatientRecords = lazy(() =>
    import("../../pages/admin/analytics/PatientRecords")
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

    {
        path: "/admin/dashboard", element:
            <><Helmet>
                <title>Dashboard | UTPALA</title>
                <meta name="description" content="Doctor dashboard overview." />
            </Helmet>
                <Dashboard />
            </>
    },
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
        path: "/admin/nursing", element:
            <><Helmet>
                <title>Nursing | UTPALA</title>
                <meta name="description" content="Nursing dashboard overview." />
            </Helmet>
                <Nursing />
            </>
    },
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
        path: "/admin/pharmacists", element:
            <><Helmet>
                <title>Pharmacists | UTPALA</title>
                <meta name="description" content="Pharmacists dashboard overview." />
            </Helmet>
                <Pharmacists />
            </>
    },
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
        path: "/admin/patients", element:
            <><Helmet>
                <title>Patients | UTPALA</title>
                <meta name="description" content="Patients dashboard overview." />
            </Helmet>
                <Patients />
            </>
    },
    // Treatment Therapists =================================
    {
        path: "/therapist/view", element:
            <><Helmet>
                <title>Therapist | UTPALA</title>
                <meta name="description" content="Patients dashboard overview." />
            </Helmet>
                <Therapists_View />
            </>
    },
    {
        path: "/therapist/assignments/view", element:

            <><Helmet>
                <title>Therapist Assignments | UTPALA</title>
                <meta name="description" content="Therapist assignments overview." />
            </Helmet>
                <Therapists_Assignment_View />
            </>
    },

    // Consultation =========================================
    // ===== slot ===============
    {
        path: "/consultation/slot/view", element:

            <><Helmet>
                <title>Consultation Slots | UTPALA</title>
                <meta name="description" content="Consultation slots overview." />
            </Helmet>
                <Slot_View /></>
    },
    // {path : "/consultation/add" ,}

    // ===== consultation ===============
    {
        path: "/consultation/view", element:

            <><Helmet>
                <title>Consultation | UTPALA</title>
                <meta name="description" content="Consultation overview." />
            </Helmet>
                <Consultation_View /></>
    },

    // Stock List =====================
    {
        path: "/inventory/view", element:

            <><Helmet>
                <title>Inventory | UTPALA</title>
                <meta name="description" content="Inventory overview." />
            </Helmet>
                <Inventory_View /></>
    },
    {
        path: "/inventory/batch-log/:stockId", element:

            <><Helmet>
                <title>Batch Log | UTPALA</title>
                <meta name="description" content="Batch log overview." />
            </Helmet>
                <Batch_Log_View /></>
    },

    // Food Charges ===================
    {
        path: "/foodcharges/view", element:

            <><Helmet>
                <title>Food Charges | UTPALA</title>
                <meta name="description" content="Food charges overview." />
            </Helmet>
                <Food_Charges_View /></>
    },

    // analytics =============================
    {
        path: "/analytics/admissions", element:

            <><Helmet>
                <title>Admissions | UTPALA</title>
                <meta name="description" content="Admissions overview." />
            </Helmet>
                <Admissions_View /></>
    },
    {
        path: "/analytics/discharges", element:
            <><Helmet>
                <title>Discharges | UTPALA</title>
                <meta name="description" content="Discharges overview." />
            </Helmet>
                <Discharges /></>
    },
    {
        path: "/analytics/patient-records", element:
            <><Helmet>
                <title>Patient Records | UTPALA</title>
                <meta name="description" content="Patient records overview." />
            </Helmet>
                <PatientRecords /></>
    },

];
