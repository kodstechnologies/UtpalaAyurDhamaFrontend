// src/router/subRouter/receptionRoutes.jsx

import Appointments_View from "../../pages/receptionist/appointments/View";
import Receptionist_dashboard from "../../pages/receptionist/dashboard";
import Inpatient_View from "../../pages/receptionist/inpatient/View";
import InpatientBilling from "../../pages/receptionist/inpatient/Billing";
import Marketing_View from "../../pages/receptionist/marketing/View";
import Payments_View from "../../pages/receptionist/payments/View";
import Reports_View from "../../pages/receptionist/reports/View";

export const receptionRoutes = [
    { path: "/receptionist/dashboard", element: <Receptionist_dashboard /> },
    { path: "/receptionist/appointments", element: <Appointments_View /> },
    { path: "/receptionist/inpatient", element: <Inpatient_View /> },
    { path: "/receptionist/inpatient-billing/:id", element: <InpatientBilling /> },
    { path: "/receptionist/payments", element: <Payments_View /> },
    { path: "/receptionist/marketing", element: <Marketing_View /> },
    { path: "/receptionist/reports", element: <Reports_View /> },
];
