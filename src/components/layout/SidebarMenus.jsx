// import {
//     Dashboard as DashboardIcon,
//     MedicalServices as MedicalServicesIcon,
//     ReceiptLong as ReceiptLongIcon,
//     Inventory2 as Inventory2Icon,
//     RestaurantMenu as RestaurantMenuIcon,
//     Analytics as AnalyticsIcon,
// } from "@mui/icons-material";

// export const sidebarMenus = {
//     admin: [
//         {
//             key: "admin_menu",
//             label: "Admin",
//             icon: <DashboardIcon style={{ color: "var(--color-icons)" }} />,
//             children: [
//                 { key: "dashboard", to: "/admin/dashboard", label: "Dashboard" },
//                 { key: "doctors", to: "/admin/doctors", label: "Doctors" },
//                 { key: "nursing", to: "/admin/nursing", label: "Nursing" },
//                 { key: "receptionists", to: "/admin/receptionists", label: "Receptionists" },
//                 { key: "pharmacists", to: "/admin/pharmacists", label: "Pharmacists" },
//                 { key: "therapists", to: "/admin/therapists", label: "Therapists" },
//                 { key: "patients", to: "/admin/patients", label: "Patients" },
//             ],
//         },

//         {
//             key: "therapy",
//             label: "Therapy",
//             icon: <MedicalServicesIcon style={{ color: "var(--color-icons)" }} />,
//             children: [
//                 { key: "therapy_view", label: "Therapies", to: "/therapist/view" },
//                 { key: "therapy_assign", label: "Assignments", to: "/therapist/assignments/view" },
//             ],
//         },

//         {
//             key: "consult",
//             label: "Consultation",
//             icon: <ReceiptLongIcon style={{ color: "var(--color-icons)" }} />,
//             children: [
//                 { key: "slot", label: "Slot", to: "/consultation/slot/view" },
//                 { key: "fees", label: "Consultation", to: "/consultation/view" },
//             ],
//         },

//         {
//             key: "inventory",
//             label: "Inventory",
//             icon: <Inventory2Icon style={{ color: "var(--color-icons)" }} />,
//             children: [
//                 { key: "inventory_view", label: "Inventory", to: "/inventory/view" },
//             ],
//         },

//         {
//             key: "food",
//             label: "Food Charges",
//             icon: <RestaurantMenuIcon style={{ color: "var(--color-icons)" }} />,
//             children: [
//                 { key: "food_view", label: "Food Charges", to: "/foodcharges/view" },
//             ],
//         },

//         {
//             key: "analytics",
//             label: "Analytics",
//             icon: <AnalyticsIcon style={{ color: "var(--color-icons)" }} />,
//             children: [
//                 { key: "admissions", label: "Admission List", to: "/analytics/admissions" },
//                 { key: "discharge", label: "Discharge Report", to: "/analytics/discharges" },
//                 { key: "records", label: "Patient Records", to: "/analytics/patient-records" },
//             ],
//         },
//     ],

//     doctor: [
//         {
//             key: "dashboard",
//             label: "Dashboard",
//             icon: <DashboardIcon />,
//             to: "/doctor/dashboard",
//         },
//         {
//             key: "mypatients",
//             label: "My Patients",
//             icon: <DashboardIcon />,
//             to: "/doctor/my-patients",
//         },
//         {
//             key: "inpatients",
//             label: "In-Patients",
//             icon: <DashboardIcon />,
//             to: "/doctor/in-patients",
//         },
//     ],

// };


import {
    Dashboard as DashboardIcon,
    MedicalServices as MedicalServicesIcon,
    ReceiptLong as ReceiptLongIcon,
    Inventory2 as Inventory2Icon,
    RestaurantMenu as RestaurantMenuIcon,
    Analytics as AnalyticsIcon,

    //doctor 
    People as PeopleIcon,
    LocalHospital as LocalHospitalIcon,

    // nurse 
    MonitorHeart as MonitorHeartIcon,
    AssignmentTurnedIn as AssignmentTurnedInIcon,
} from "@mui/icons-material";

export const sidebarMenus = {
    admin: [
        {
            key: "admin_menu",
            label: "Admin",
            icon: <DashboardIcon style={{ color: "var(--color-icons)" }} />,
            children: [
                { key: "dashboard", to: "/admin/dashboard", label: "Dashboard" },
                { key: "doctors", to: "/admin/doctors", label: "Doctors" },
                { key: "nursing", to: "/admin/nursing", label: "Nursing" },
                { key: "receptionists", to: "/admin/receptionists", label: "Receptionists" },
                { key: "pharmacists", to: "/admin/pharmacists", label: "Pharmacists" },
                { key: "therapists", to: "/admin/therapists", label: "Therapists" },
                { key: "patients", to: "/admin/patients", label: "Patients" },
            ],
        },

        {
            key: "therapy",
            label: "Therapy",
            icon: <MedicalServicesIcon style={{ color: "var(--color-icons)" }} />,
            children: [
                { key: "therapy_view", label: "Therapies", to: "/therapist/view" },
                { key: "therapy_assign", label: "Assignments", to: "/therapist/assignments/view" },
            ],
        },

        {
            key: "consult",
            label: "Consultation",
            icon: <ReceiptLongIcon style={{ color: "var(--color-icons)" }} />,
            children: [
                { key: "slot", label: "Slot", to: "/consultation/slot/view" },
                { key: "fees", label: "Consultation", to: "/consultation/view" },
            ],
        },

        {
            key: "inventory",
            label: "Inventory",
            icon: <Inventory2Icon style={{ color: "var(--color-icons)" }} />,
            children: [
                { key: "inventory_view", label: "Inventory", to: "/inventory/view" },
            ],
        },

        {
            key: "food",
            label: "Food Charges",
            icon: <RestaurantMenuIcon style={{ color: "var(--color-icons)" }} />,
            children: [
                { key: "food_view", label: "Food Charges", to: "/foodcharges/view" },
            ],
        },

        {
            key: "analytics",
            label: "Analytics",
            icon: <AnalyticsIcon style={{ color: "var(--color-icons)" }} />,
            children: [
                { key: "admissions", label: "Admission List", to: "/analytics/admissions" },
                { key: "discharge", label: "Discharge Report", to: "/analytics/discharges" },
                { key: "records", label: "Patient Records", to: "/analytics/patient-records" },
            ],
        },
    ],

    doctor: [
        {
            key: "dashboard",
            label: "Dashboard",
            icon: <DashboardIcon />,
            to: "/doctor/dashboard",
        },
        {
            key: "myPatients",
            label: "My Patients",
            icon: <PeopleIcon />,
            to: "/doctor/my-patients",
        },
        {
            key: "inPatients",
            label: "In-Patients",
            icon: <LocalHospitalIcon />,
            to: "/doctor/in-patients",
        },
    ],


    nurse: [
        {
            key: "dashboard",
            label: "Dashboard",
            icon: <DashboardIcon />,
            to: "/nurse/dashboard",
        },
        {
            key: "patientMonitoring",
            label: "Patient Monitoring",
            icon: <MonitorHeartIcon />,  // updated icon
            to: "/nurse/monitoring",
        },
        {
            key: "dischargePreparation",
            label: "Discharge Preparation",
            icon: <AssignmentTurnedInIcon />, // updated icon
            to: "/nurse/patients",
        },
    ],



};