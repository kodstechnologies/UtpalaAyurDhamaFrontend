// src/routes/adminRoutes.jsx
import Dashboard from "../../pages/admin/dashboard";
import Doctors from "../../pages/admin/Doctors";
import Nursing from "../../pages/admin/Nursing";
import Receptionists from "../../pages/admin/Receptionists";
import Pharmacists from "../../pages/admin/Pharmacists";
import Therapists from "../../pages/admin/Therapists";
import Patients from "../../pages/admin/Patients";

// Treatment Therapists =================================
import TreatmentTherapists from "../../pages/admin/TreatmentTherapists/Therapists/View"

// Consultation =========================================
import Slot_View from "../../pages/admin/Consultation/slot/View";
import Consultation_View from "../../pages/admin/Consultation/DoctorConsultation/View";
import Therapists_View from "../../pages/admin/TreatmentTherapists/Therapists/View";
import Therapists_Assignment_View from "../../pages/admin/TreatmentTherapists/TherapistsAssignment/View";
import Inventory_View from "../../pages/admin/inventory/View";
import Food_Charges_View from "../../pages/admin/Foodcharges/View";
import Admissions_View from "../../pages/admin/analytics/admissions";
import Discharges from "../../pages/admin/analytics/Discharges";
import PatientRecords from "../../pages/admin/analytics/PatientRecords";

// Stock List======================================

export const adminRoutes = [
    { path: "/admin/dashboard", element: <Dashboard /> },
    { path: "/admin/doctors", element: <Doctors /> },
    { path: "/admin/nursing", element: <Nursing /> },
    { path: "/admin/receptionists", element: <Receptionists /> },
    { path: "/admin/pharmacists", element: <Pharmacists /> },
    { path: "/admin/therapists", element: <Therapists /> },
    { path: "/admin/patients", element: <Patients /> },

    // Treatment Therapists =================================
    { path: "/therapist/view", element: <Therapists_View /> },
    { path: "/therapist/assignments/view", element: <Therapists_Assignment_View /> },

    // Consultation =========================================
    // ===== slot ===============
    { path: "/consultation/slot/view", element: <Slot_View /> },
    // {path : "/consultation/add" ,}

    // ===== consultation ===============
    { path: "/consultation/view", element: <Consultation_View /> },

    // Stock List =====================
    { path: "/inventory/view", element: <Inventory_View /> },

    // Food Charges ===================
    { path: "/foodcharges/view", element: <Food_Charges_View /> },
    
    // analytics =============================
    { path: "/analytics/admissions", element: <Admissions_View /> },
    { path: "/analytics/discharges", element: <Discharges /> },
    { path: "/analytics/patient-records", element: <PatientRecords /> },

];
