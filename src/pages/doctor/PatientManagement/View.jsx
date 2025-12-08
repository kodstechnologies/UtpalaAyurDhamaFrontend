import React, { useState } from "react";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCard from "../../../components/card/HeadingCard";
import DashboardCard from "../../../components/card/DashboardCard";
import TableComponent from "../../../components/table/TableComponent"; // Use standard TableComponent

// Modals
import AddPrescription from "../../../components/card/tableRelated/AddPrescription"; // Adjust path as needed
import AddDailyCheckup from "../../../components/card/tableRelated/AddDailyCheckup"; // Adjust path as needed
import AddTherapyPlan from "../../../components/card/tableRelated/AddTherapyPlan"; // Adjust path as needed

// ICONS
import PeopleIcon from "@mui/icons-material/People";
import LocalHospital from "@mui/icons-material/LocalHospital";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { Stethoscope, Pill } from 'lucide-react';

// Define fields for the form modals
const fields = [
    { name: 'patientName', label: 'Patient Name', type: 'text', required: true },
    { name: 'roomNo', label: 'Room No.', type: 'text', required: true },
    { name: 'admittedOn', label: 'Admitted On', type: 'date', required: true },
    { name: 'reason', label: 'Reason', type: 'text', required: true },
    {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
            { value: 'Admitted', label: 'Admitted' },
            { value: 'Under Treatment', label: 'Under Treatment' },
            { value: 'Recovery', label: 'Recovery' },
            { value: 'Discharged', label: 'Discharged' },
            { value: 'Critical', label: 'Critical' },
        ],
    },
];

// Placeholder API functions - replace with actual API calls
const createPatientAPI = async (data) => {
    // Simulate API call
    const newId = Date.now().toString();
    const newPatient = { _id: newId, ...data };
    console.log('Created patient:', newPatient);
    return newPatient;
};

const updatePatientAPI = async (data, id) => {
    // Simulate API call
    console.log('Updated patient:', { _id: id, ...data });
    return { _id: id, ...data };
};

const deletePatientAPI = async (id) => {
    // Simulate API call
    console.log('Deleted patient:', id);
};

// Modal submit handlers
const handlePrescriptionSubmit = (data) => {
    console.log('Prescription added:', data);
    // Implement API call or state update here
};

const handleDailyCheckupSubmit = (data) => {
    console.log('Daily checkup added:', data);
    // Implement API call or state update here
};

const handleTherapyPlanSubmit = (data) => {
    console.log('Therapy plan added:', data);
    // Implement API call or state update here
};

function Patient_Management_View() {
    // Modal states
    const [prescriptionOpen, setPrescriptionOpen] = useState(false);
    const [dailyCheckupOpen, setDailyCheckupOpen] = useState(false);
    const [therapyPlanOpen, setTherapyPlanOpen] = useState(false);
    const [selectedPatientName, setSelectedPatientName] = useState('');

    const [rows, setRows] = useState([
        {
            _id: "1",
            patientName: "Rakesh Mohanty",
            roomNo: "101",
            admittedOn: "2025-01-10",
            reason: "Fever & Weakness",
            status: "Admitted"
        },
        {
            _id: "2",
            patientName: "Priya Sharma",
            roomNo: "202",
            admittedOn: "2025-01-12",
            reason: "Body Pain",
            status: "Under Treatment"
        },
        {
            _id: "3",
            patientName: "Arun Das",
            roomNo: "305",
            admittedOn: "2025-01-14",
            reason: "Accident Injury",
            status: "Recovery"
        },
        {
            _id: "4",
            patientName: "Sneha Patnaik",
            roomNo: "115",
            admittedOn: "2025-01-08",
            reason: "High BP",
            status: "Discharged"
        },
        {
            _id: "5",
            patientName: "John Abraham",
            roomNo: "410",
            admittedOn: "2025-01-18",
            reason: "Chest Pain",
            status: "Critical"
        }
    ]);

    // Dynamic dashboard counts based on rows
    const totalPatients = rows.length;
    const activeTreatments = rows.filter(row => ['Admitted', 'Under Treatment', 'Recovery', 'Critical'].includes(row.status)).length;
    const completed = rows.filter(row => row.status === 'Discharged').length;
    const pending = rows.filter(row => row.status === 'Critical').length; // Assuming Critical as pending; adjust as needed

    const columns = [
        { field: "patientName", header: "Patient Name" },
        { field: "roomNo", header: "Room No." },
        { field: "admittedOn", header: "Admitted On" },
        { field: "reason", header: "Reason" },
        { field: "status", header: "Status" }
    ];

    const handleCreateSubmit = async (data) => {
        const newPatient = await createPatientAPI(data);
        setRows(prev => [...prev, newPatient]);
    };

    const handleEditSubmit = async (data, row) => {
        const updatedPatient = await updatePatientAPI(data, row._id);
        setRows(prev => prev.map(r => r._id === row._id ? updatedPatient : r));
    };

    const handleDelete = (id) => {
        if (window.confirm(`Are you sure you want to delete patient ${id}?`)) {
            deletePatientAPI(id);
            setRows(prev => prev.filter(r => r._id !== id));
        }
    };

    // Custom action handlers (updated to open modals)
    const handleAssignDoctor = (row) => {
        setSelectedPatientName(row.patientName);
        setTherapyPlanOpen(true); // Open AddTherapyPlan modal for Assign Doctor
    };

    const handlePrescribeMedication = (row) => {
        setSelectedPatientName(row.patientName);
        setPrescriptionOpen(true); // Open AddPrescription modal
    };

    const handleViewRecords = (row) => {
        setSelectedPatientName(row.patientName);
        setDailyCheckupOpen(true); // Open AddDailyCheckup modal for View Records / Daily Checkup
    };

    // Custom Actions Array (3 dynamic actions)
    const customActions = [
        {
            icon: <AssignmentIcon fontSize="small" />,
            color: "var(--color-success)",
            onClick: handleAssignDoctor,
            tooltip: "Assign Doctor",
        },
        {
            icon: <Stethoscope fontSize="small" />,
            color: "var(--color-info)",
            onClick: handlePrescribeMedication,
            tooltip: "Prescribe Medication",
        },
        {
            icon: <Pill fontSize="small" />,
            color: "var(--color-warning)",
            onClick: handleViewRecords,
            tooltip: "View Records",
        },
    ];

    // --------------- UI ---------------
    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Doctor", url: "/doctor/dashboard" },
                    { label: "All Patients" },
                ]}
            />

            <HeadingCard
                title="Patient Management"
                subtitle="View and manage all patients, their admissions, treatments, and statuses."
            />

            {/* DASHBOARD CARDS */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "20px",
                    marginTop: "25px",
                    marginBottom: "20px",
                }}
            >
                <DashboardCard
                    title="Total Patients"
                    count={totalPatients}
                    icon={PeopleIcon}
                />

                <DashboardCard
                    title="Active Treatments"
                    count={activeTreatments}
                    icon={LocalHospital}
                    iconColor="#2e7d32"
                />

                <DashboardCard
                    title="Completed"
                    count={completed}
                    icon={CheckCircleIcon}
                    iconColor="#388e3c"
                />

                <DashboardCard
                    title="Pending"
                    count={pending}
                    icon={PendingActionsIcon}
                    iconColor="#ed6c02"
                />
            </div>

            {/* TABLE SECTION */}
            <TableComponent
                title="All Patients List"
                columns={columns}
                rows={rows}
                // For modals: pass formFields and submit handlers
                formFields={fields}
                onCreateSubmit={handleCreateSubmit}
                onEditSubmit={handleEditSubmit}
                // Enable default view, edit, delete
                showView={true}
                showEdit={true}
                showDelete={true}
                onDelete={handleDelete}
                // Pass dynamic custom actions
                customActions={customActions}
            />

            {/* Modals */}
            <AddPrescription
                open={prescriptionOpen}
                onClose={() => setPrescriptionOpen(false)}
                patientName={selectedPatientName}
                onAdd={handlePrescriptionSubmit}
            />
            <AddDailyCheckup
                open={dailyCheckupOpen}
                onClose={() => setDailyCheckupOpen(false)}
                onAdd={handleDailyCheckupSubmit}
            />
            <AddTherapyPlan
                open={therapyPlanOpen}
                onClose={() => setTherapyPlanOpen(false)}
                patientName={selectedPatientName}
                onAdd={handleTherapyPlanSubmit}
            />
        </div>
    );
}

export default Patient_Management_View;