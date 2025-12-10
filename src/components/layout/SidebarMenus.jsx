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

    // receptionist 
    EventNote as EventNoteIcon,
    Hotel as HotelIcon,
    Payments as PaymentsIcon,
    Campaign as CampaignIcon,
    Assessment as AssessmentIcon,

    // therapist 
    HealthAndSafety as HealthAndSafetyIcon,
    Psychology as PsychologyIcon,

    // patient 
    Group as GroupIcon,
    Spa as SpaIcon,
    Medication as MedicationIcon

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
            icon: <DashboardIcon style={{ color: "var(--color-icons)" }} />,
            to: "/doctor/dashboard",
        },
        {
            key: "myPatients",
            label: "My Patients",
            icon: <PeopleIcon style={{ color: "var(--color-icons)" }} />,
            to: "/doctor/my-patients",
        },
        {
            key: "inPatients",
            label: "In-Patients",
            icon: <LocalHospitalIcon style={{ color: "var(--color-icons)" }} />,
            to: "/doctor/in-patients",
        },
    ],


    nurse: [
        {
            key: "dashboard",
            label: "Dashboard",
            icon: <DashboardIcon style={{ color: "var(--color-icons)" }} />,
            to: "/nurse/dashboard",
        },
        {
            key: "patientMonitoring",
            label: "Patient Monitoring",
            icon: <MonitorHeartIcon style={{ color: "var(--color-icons)" }} />,  // updated icon
            to: "/nurse/monitoring",
        },
        {
            key: "dischargePreparation",
            label: "Discharge Preparation",
            icon: <AssignmentTurnedInIcon style={{ color: "var(--color-icons)" }} />,
            to: "/nurse/discharge-preparation",
        }
        ,
    ],
    receptionist: [
        {
            key: "dashboard",
            label: "Dashboard",
            icon: <DashboardIcon style={{ color: "var(--color-icons)" }} />,
            to: "/receptionist/dashboard",
        },
        {
            key: "appointments",
            label: "Appointments",
            icon: <EventNoteIcon style={{ color: "var(--color-icons)" }} />,
            to: "/receptionist/appointments",
        },
        {
            key: "inpatients",
            label: "Inpatients",
            icon: <HotelIcon style={{ color: "var(--color-icons)" }} />,
            to: "/receptionist/inpatient",
        },
        {
            key: "payments",
            label: "Payments",
            icon: <PaymentsIcon style={{ color: "var(--color-icons)" }} />,
            to: "/receptionist/payments",
        },
        {
            key: "marketing",
            label: "Marketing",
            icon: <CampaignIcon style={{ color: "var(--color-icons)" }} />,
            to: "/receptionist/marketing",
        },
        {
            key: "reports",
            label: "Reports",
            icon: <AssessmentIcon style={{ color: "var(--color-icons)" }} />,
            to: "/receptionist/reports",
        },
    ],
    pharmacist: [
        {
            key: "dashboard",
            label: "Dashboard",
            icon: <DashboardIcon style={{ color: "var(--color-icons)" }} />,
            to: "/pharmacist/dashboard",
        },

        {
            key: "prescriptions",
            label: "Prescriptions",
            icon: <MedicalServicesIcon style={{ color: "var(--color-icons)" }} />,
            children: [
                {
                    key: "outpatient",
                    label: "Outpatient",
                    to: "/pharmacist/prescriptions/outpatient",
                    icon: <MedicalServicesIcon style={{ color: "var(--color-icons)" }} />,
                },
                {
                    key: "inpatient",
                    label: "Inpatient",
                    to: "/pharmacist/prescriptions/inpatient",
                    icon: <MedicalServicesIcon style={{ color: "var(--color-icons)" }} />,
                },
            ],
        },

        {
            key: "inventory",
            label: "Inventory",
            icon: <AssignmentTurnedInIcon style={{ color: "var(--color-icons)" }} />,
            to: "/pharmacist/inventory",
        },
    ]
    ,
    therapist: [
        {
            key: "dashboard",
            label: "Dashboard",
            icon: <DashboardIcon style={{ color: "var(--color-icons)" }} />,
            to: "/therapist/dashboard",
        },
        {
            key: "patientMonitoring",
            label: "Patient Monitoring",
            icon: <HealthAndSafetyIcon style={{ color: "var(--color-icons)" }} />,
            to: "/therapist/patient-monitoring",
        },
        {
            key: "therapyProgress",
            label: "Therapy Progress",
            icon: <PsychologyIcon style={{ color: "var(--color-icons)" }} />,
            to: "/therapist/therapy-progress",
        },
    ],

    patient: [
        {
            key: "dashboard",
            label: "Dashboard",
            icon: <DashboardIcon style={{ color: "var(--color-icons)" }} />,
            to: "/patient/dashboard",
        },
        {
            key: "familyMembers",
            label: "Family Members",
            icon: <GroupIcon style={{ color: "var(--color-icons)" }} />,
            to: "/patient/family",
        },
        {
            key: "consultations",
            label: "My Consultations",
            icon: <EventNoteIcon style={{ color: "var(--color-icons)" }} />,
            to: "/patient/consultations",
        },
        {
            key: "prescriptions",
            label: "Prescriptions",
            icon: <MedicationIcon style={{ color: "var(--color-icons)" }} />,
            to: "/patient/prescriptions",
        },
        {
            key: "therapies",
            label: "Therapies",
            icon: <SpaIcon style={{ color: "var(--color-icons)" }} />,
            to: "/patient/therapies",
        },
        {
            key: "reports",
            label: "Reports",
            icon: <AssessmentIcon style={{ color: "var(--color-icons)" }} />,
            to: "/patient/reports",
        },

    ]

};