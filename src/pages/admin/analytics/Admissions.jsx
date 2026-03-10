import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import HeadingCard from "../../../components/card/HeadingCard";
import TableComponent from "../../../components/table/TableComponent";
import CardBorder from "../../../components/card/CardBorder";
import Search from "../../../components/search/Search";
import ExportDataButton from "../../../components/buttons/ExportDataButton";
import { getApiUrl, getAuthHeaders } from "../../../config/api";

// Helper function to format date
const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

function Admissions_View() {
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchText, setSearchText] = useState("");

    const fetchAdmissions = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch all inpatients (admissions)
            const response = await fetch(getApiUrl("inpatients?limit=1000"), {
                method: "GET",
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error("Failed to fetch admissions");
            }

            const data = await response.json();
            if (data.success && data.data) {
                // Transform the data to match table structure
                const transformedAdmissions = data.data.map((inpatient) => ({
                    _id: inpatient._id,
                    patientId: inpatient.patient?.patientId || inpatient.patient?._id || "N/A",
                    patientName: inpatient.patient?.user?.name || "N/A",
                    mobile: inpatient.patient?.user?.phone || "N/A",
                    admissionDate: formatDate(inpatient.admissionDate),
                    admissionDateRaw: inpatient.admissionDate, // For sorting
                    status: inpatient.status || "Admitted",
                    roomNumber: inpatient.roomNumber || "N/A",
                    bedNumber: inpatient.bedNumber || "N/A",
                    doctorName: inpatient.doctor?.user?.name || "N/A",
                }));
                
                // Sort by admission date (newest first)
                transformedAdmissions.sort((a, b) => {
                    const dateA = new Date(a.admissionDateRaw || 0);
                    const dateB = new Date(b.admissionDateRaw || 0);
                    return dateB - dateA;
                });
                
                setRows(transformedAdmissions);
            } else {
                toast.error(data.message || "Failed to fetch admissions");
            }
        } catch (error) {
            console.error("Error fetching admissions:", error);
            toast.error(error.message || "Failed to fetch admissions");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdmissions();
    }, [fetchAdmissions]);

    const columns = [
        { field: "patientId", header: "Patient ID" },
        { field: "patientName", header: "Patient Name" },
        { field: "mobile", header: "Mobile No" },
        { field: "admissionDate", header: "Admission Date" },
        { field: "status", header: "Status" },
    ];

    // Filter rows based on search text (search in patientName and patientId)
    const filteredRows = rows.filter(row =>
        row.patientName.toLowerCase().includes(searchText.toLowerCase()) ||
        row.patientId.toLowerCase().includes(searchText.toLowerCase()) ||
        row.mobile.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
            <HeadingCard
                title="Admissions List"
                subtitle="Monitor active and past patient admissions, track essential patient details, and maintain accurate records for smooth hospital operations and reporting."
                breadcrumbItems={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Analytics" },
                    { label: "Admission List" }
                ]}
            />
            {/* SEARCH + EXPORT */}
            <CardBorder
                justify="between"
                align="center"
                wrap={true}
                padding="2rem"
                style={{ width: "100%" }}
            >
                {/* LEFT SIDE — Search */}
                <div style={{ flex: 1, marginRight: "1rem" }}>
                    <Search
                        value={searchText}
                        onChange={(val) => setSearchText(val)}
                        style={{ width: "100%" }}
                    />
                </div>

                {/* RIGHT SIDE — Export Button */}
                <div style={{ display: "flex", gap: "1rem" }}>
                    <ExportDataButton
                        rows={filteredRows}
                        columns={columns}
                        fileName="admissions.xlsx"
                    />
                </div>
            </CardBorder>

            {isLoading ? (
                <div className="flex justify-center items-center p-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
                        style={{ borderColor: "var(--color-btn-b)", borderBottomColor: "transparent" }}></div>
                </div>
            ) : (
                <TableComponent
                    columns={columns}
                    rows={filteredRows}
                    showStatusBadge={true}
                    statusField="status"
                />
            )}
        </div>
    );
}

export default Admissions_View;
