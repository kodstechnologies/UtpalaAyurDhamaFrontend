// // src/router/subRouter/frontOfficeRoutes.jsx

// import React from "react";

// import Outpatient from "../../pages/FrontOffice/outPatient";
// import AddOPD from "../../components/FrontOffice/Outpatient/Add";
// import InPatient from "../../pages/FrontOffice/InPatient";
// import AddInpatient from "../../components/FrontOffice/Inpatient/Add";
// import DoctorVisit from "../../components/FrontOffice/Inpatient/DoctorVisit";
// import CreateNewVisit from "../../components/FrontOffice/Inpatient/CreateNewVisit";
// import PatientBillAccount from "../../components/FrontOffice/Inpatient/PatientBillAccount";
// import DischargeForm from "../../pages/FrontOffice/DischargeForm";
// import SendOrder from "../../pages/FrontOffice/SendOrder";
// import VitalManagement from "../../pages/FrontOffice/VitalManagement";

// import Patients from "../../pages/FrontOffice/Patients";
// import AddPatient from "../../components/FrontOffice/Patients/Add";

// import Appointments from "../../pages/FrontOffice/Appointments";
// import Emergency from "../../pages/FrontOffice/Emergency";
// import TokenBoard from "../../pages/FrontOffice/TokenBoard";
// import AddToken from "../../pages/FrontOffice/AddToken";
// import BedAvailability from "../../pages/FrontOffice/BedAvailability";
// import QueueManagement from "../../pages/FrontOffice/QueueManagement";

// import OpdView from "../../pages/FrontOffice/OpdView";
// import Vitals from "../../pages/FrontOffice/Vitals";

// import PatientFeedback from "../../pages/FrontOffice/PatientFeedback";
// import AddFeedback from "../../pages/FrontOffice/AddFeedback";

// export const frontOfficeRoutes = [
//     // Outpatient
//     { path: "/outpatient", element: <Outpatient /> },
//     { path: "/outpatient/add-opd", element: <AddOPD /> },

//     // Inpatient
//     { path: "/inpatient", element: <InPatient /> },
//     { path: "/inpatient/add", element: <AddInpatient /> },
//     { path: "/inpatient/doctor-visit", element: <DoctorVisit /> },
//     { path: "/inpatient/doctor-visit/create-new-visit", element: <CreateNewVisit /> },
//     { path: "/inpatient/patient-bill-account", element: <PatientBillAccount /> },
//     { path: "/inpatient/discharge-form", element: <DischargeForm /> },
//     { path: "/inpatient/send-order", element: <SendOrder /> },
//     { path: "/inpatient/vital-details", element: <VitalManagement /> },

//     // Patients
//     { path: "/patients", element: <Patients /> },
//     { path: "/add-patient", element: <AddPatient /> },

//     // Appointments & Emergency
//     { path: "/appointments", element: <Appointments /> },
//     { path: "/emergency", element: <Emergency /> },

//     // Token Board
//     { path: "/token-board", element: <TokenBoard /> },
//     { path: "/token-board/add", element: <AddToken /> },

//     // Bed Availability
//     { path: "/bed-availability", element: <BedAvailability /> },

//     // Queue Management
//     { path: "/queue-management", element: <QueueManagement /> },

//     // OPD View & Vitals
//     { path: "/opd-view/:uhid", element: <OpdView /> },
//     { path: "/vitals/:uhid", element: <Vitals /> },

//     // Feedback
//     { path: "/patient-feedback", element: <PatientFeedback /> },
//     { path: "/patient-feedback/add-feedback", element: <AddFeedback /> },
// ];
