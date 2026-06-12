import InvoiceDetails from "../../receptionist/payments/InvoiceDetails";

function AdminInvoiceDetails() {
    return (
        <InvoiceDetails
            homeUrl="/admin/dashboard"
            backUrl="/admin/analytics/payment-reports"
            paymentsListUrl="/admin/analytics/payment-reports"
            paymentsListLabel="Payment Reports"
        />
    );
}

export default AdminInvoiceDetails;
