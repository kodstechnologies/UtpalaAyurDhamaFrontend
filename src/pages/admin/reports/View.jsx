import Reports_View from "../../receptionist/reports/View";

function AdminReports_View() {
    return (
        <Reports_View
            homeUrl="/admin/dashboard"
            invoiceBasePath="/admin/payments/invoice"
        />
    );
}

export default AdminReports_View;
