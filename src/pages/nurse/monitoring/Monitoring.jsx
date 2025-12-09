import { useState, useMemo } from "react";
import { Box } from "@mui/material";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import HeadingCardingCard from "../../../components/card/HeadingCard";
import { toast } from "react-toastify";

// Icons
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import SearchIcon from "@mui/icons-material/Search";

// Mock data - will be replaced with API calls later
const mockAdmittedPatients = [
        {
        id: "inp-1",
        patientId: "PAT-001",
            patientName: "Ramesh Kumar",
        age: 45,
        gender: "Male",
        ward: "Ward 3",
        bed: "Bed 12",
            admissionDate: "2025-01-04",
        doctorName: "Dr. Anil Singh",
        },
        {
        id: "inp-2",
        patientId: "PAT-002",
            patientName: "Sita Devi",
        age: 38,
        gender: "Female",
        ward: "Ward 1",
        bed: "Bed 05",
            admissionDate: "2025-01-02",
        doctorName: "Dr. Priya Sharma",
    },
    {
        id: "inp-3",
        patientId: "PAT-003",
        patientName: "Amit Verma",
        age: 52,
        gender: "Male",
        ward: "Ward 2",
        bed: "Bed 08",
        admissionDate: "2025-01-05",
        doctorName: "Dr. Rajesh Kumar",
    },
    {
        id: "inp-4",
        patientId: "PAT-004",
        patientName: "Priya Patel",
        age: 35,
        gender: "Female",
        ward: "Ward 1",
        bed: "Bed 10",
        admissionDate: "2025-01-06",
        doctorName: "Dr. Priya Sharma",
        },
    ];

const mockFoodItems = {
    breakfast: [
        { id: "f1", name: "Idli", price: 50, description: "Steamed rice cakes" },
        { id: "f2", name: "Dosa", price: 60, description: "Crispy crepe" },
        { id: "f3", name: "Upma", price: 45, description: "Semolina dish" },
        { id: "f4", name: "Poha", price: 40, description: "Flattened rice" },
    ],
    lunch: [
        { id: "l1", name: "Rice & Dal", price: 80, description: "Lentil curry" },
        { id: "l2", name: "Vegetable Curry", price: 90, description: "Mixed vegetables" },
        { id: "l3", name: "Roti", price: 15, description: "Indian bread" },
        { id: "l4", name: "Sabzi", price: 70, description: "Vegetable dish" },
    ],
    dinner: [
        { id: "d1", name: "Rice & Dal", price: 80, description: "Lentil curry" },
        { id: "d2", name: "Chapati", price: 20, description: "Wheat bread" },
        { id: "d3", name: "Vegetable Curry", price: 90, description: "Mixed vegetables" },
    ],
    juice: [
        { id: "j1", name: "Orange Juice", price: 30, description: "Fresh orange" },
        { id: "j2", name: "Apple Juice", price: 35, description: "Fresh apple" },
        { id: "j3", name: "Coconut Water", price: 40, description: "Fresh coconut" },
    ],
};

function Patient_Monitoring() {
    const [admittedPatients] = useState(mockAdmittedPatients);
    const [search, setSearch] = useState("");
    const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
    const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [activeCategory, setActiveCategory] = useState("breakfast");
    const [selectedFoodItems, setSelectedFoodItems] = useState({});
    const [additionalNotes, setAdditionalNotes] = useState("");
    const [vitalsForm, setVitalsForm] = useState({
        temperature: "",
        bloodPressure: "",
        heartRate: "",
        respiratoryRate: "",
        notes: "",
    });

    // Filter patients
    const filteredPatients = useMemo(() => {
        return admittedPatients.filter((patient) =>
            patient.patientName.toLowerCase().includes(search.toLowerCase()) ||
            patient.patientId.toLowerCase().includes(search.toLowerCase()) ||
            patient.ward.toLowerCase().includes(search.toLowerCase())
        );
    }, [admittedPatients, search]);

    // Handle Update Vitals click
    const handleUpdateVitalsClick = (patient) => {
        setSelectedPatient(patient);
        setVitalsForm({
            temperature: "",
            bloodPressure: "",
            heartRate: "",
            respiratoryRate: "",
            notes: "",
        });
        setIsVitalsModalOpen(true);
    };

    // Handle Log Food click
    const handleLogFoodClick = (patient) => {
        setSelectedPatient(patient);
        setSelectedFoodItems({});
        setAdditionalNotes("");
        setActiveCategory("breakfast");
        setIsFoodModalOpen(true);
    };

    // Handle Save Vitals
    const handleSaveVitals = (e) => {
        e.preventDefault();
        if (!vitalsForm.temperature || !vitalsForm.bloodPressure || !vitalsForm.heartRate || !vitalsForm.respiratoryRate) {
            toast.error("Please fill in all required vital signs.");
            return;
        }
        // Mock save - will be replaced with API call later
        toast.success(`Vitals updated for ${selectedPatient.patientName}`);
        setIsVitalsModalOpen(false);
        setSelectedPatient(null);
    };

    // Handle Save Food Intake
    const handleSaveFoodIntake = (e) => {
        e.preventDefault();
        const selectedCount = Object.keys(selectedFoodItems).filter((key) => selectedFoodItems[key]).length;
        if (selectedCount === 0) {
            toast.error("Please select at least one food item.");
            return;
        }
        // Mock save - will be replaced with API call later
        toast.success(`Food intake logged for ${selectedPatient.patientName}`);
        setIsFoodModalOpen(false);
        setSelectedPatient(null);
        setSelectedFoodItems({});
        setAdditionalNotes("");
    };

    // Toggle food item selection
    const toggleFoodItem = (itemId) => {
        setSelectedFoodItems((prev) => ({
            ...prev,
            [itemId]: !prev[itemId],
        }));
    };

    // Get selected food items count
    const selectedFoodCount = Object.keys(selectedFoodItems).filter((key) => selectedFoodItems[key]).length;

    // Breadcrumb items
    const breadcrumbItems = [
        { label: "Home", url: "/" },
        { label: "Patient Monitoring" },
    ];

    return (
        <Box sx={{ padding: "20px" }}>
            {/* ⭐ Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* ⭐ Page Heading */}
            <HeadingCardingCard
                category="PATIENT MONITORING"
                title="Admitted Patients"
                subtitle="Monitor patient vitals and log food intake for admitted patients"
            />

            {/* ⭐ Patients Table */}
            <Box sx={{ marginTop: 4 }}>
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="card-title mb-0">Admitted Patients</h5>
                        </div>

                        {/* Search */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <SearchIcon />
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by patient name, ID, or ward..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {filteredPatients.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th style={{ fontSize: "0.875rem" }}>Sl. No.</th>
                                            <th style={{ fontSize: "0.875rem" }}>Patient ID</th>
                                            <th style={{ fontSize: "0.875rem" }}>Patient Name</th>
                                            <th style={{ fontSize: "0.875rem" }}>Ward/Bed</th>
                                            <th style={{ fontSize: "0.875rem" }}>Admission Date</th>
                                            <th style={{ fontSize: "0.875rem" }}>Consulting Doctor</th>
                                            <th style={{ fontSize: "0.875rem", textAlign: "center" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPatients.map((patient, index) => (
                                            <tr key={patient.id}>
                                                <td style={{ fontSize: "0.875rem" }}>{index + 1}</td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.patientId}</td>
                                                <td style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                                                    {patient.patientName}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    {patient.ward} / {patient.bed}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    {new Date(patient.admissionDate).toLocaleDateString()}
                                                </td>
                                                <td style={{ fontSize: "0.875rem" }}>{patient.doctorName}</td>
                                                <td style={{ fontSize: "0.875rem" }}>
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm"
                                                            onClick={() => handleLogFoodClick(patient)}
                                                            style={{
                                                                backgroundColor: "#D4A574",
                                                                borderColor: "#D4A574",
                                                                color: "#000",
                                                                borderRadius: "8px",
                                                                padding: "6px 12px",
                                                                fontWeight: 500,
                                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                transition: "all 0.3s ease",
                                                            }}
                                                        >
                                                            <RestaurantIcon fontSize="small" className="me-1" />
                                                            Log Food
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm"
                                                            onClick={() => handleUpdateVitalsClick(patient)}
                                                            style={{
                                                                backgroundColor: "#90EE90",
                                                                borderColor: "#90EE90",
                                                                color: "#fff",
                                                                borderRadius: "8px",
                                                                padding: "6px 12px",
                                                                fontWeight: 500,
                                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                                transition: "all 0.3s ease",
                                                            }}
                                                        >
                                                            <MonitorHeartIcon fontSize="small" className="me-1" />
                                                            Update Vitals
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <LocalHospitalIcon sx={{ fontSize: 64, color: "#6c757d" }} />
                                <h5 className="mt-3 mb-2">No Patients Found</h5>
                                <p className="text-muted">Try adjusting your search query.</p>
                            </div>
                        )}
                    </div>
                </div>
            </Box>

            {/* Update Vitals Modal */}
            {isVitalsModalOpen && selectedPatient && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                        overflowY: "auto",
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ margin: "auto", maxWidth: "600px" }}>
                        <div className="modal-content" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                            <div className="modal-header" style={{ flexShrink: 0 }}>
                                <h5 className="modal-title d-flex align-items-center gap-2">
                                    <MonitorHeartIcon sx={{ color: "#90EE90" }} />
                                    Update Vitals for: {selectedPatient.patientName}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsVitalsModalOpen(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleSaveVitals} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                                <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Temperature (°F) *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={vitalsForm.temperature}
                                                onChange={(e) =>
                                                    setVitalsForm({ ...vitalsForm, temperature: e.target.value })
                                                }
                                                required
                                                step="0.1"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Blood Pressure (mmHg) *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={vitalsForm.bloodPressure}
                                                onChange={(e) =>
                                                    setVitalsForm({ ...vitalsForm, bloodPressure: e.target.value })
                                                }
                                                placeholder="e.g., 120/80"
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Heart Rate (bpm) *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={vitalsForm.heartRate}
                                                onChange={(e) =>
                                                    setVitalsForm({ ...vitalsForm, heartRate: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Respiratory Rate *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={vitalsForm.respiratoryRate}
                                                onChange={(e) =>
                                                    setVitalsForm({ ...vitalsForm, respiratoryRate: e.target.value })
                                                }
                                                required
            />
        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Notes</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={vitalsForm.notes}
                                                onChange={(e) =>
                                                    setVitalsForm({ ...vitalsForm, notes: e.target.value })
                                                }
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ flexShrink: 0, borderTop: "1px solid #dee2e6" }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsVitalsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        style={{
                                            backgroundColor: "#90EE90",
                                            borderColor: "#90EE90",
                                            color: "#fff",
                                        }}
                                    >
                                        Save Vitals
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Food Intake Modal */}
            {isFoodModalOpen && selectedPatient && (
                <div
                    className="modal show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.5)",
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                        overflowY: "auto",
                    }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ margin: "auto", maxWidth: "700px" }}>
                        <div className="modal-content" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                            <div className="modal-header" style={{ flexShrink: 0 }}>
                                <h5 className="modal-title d-flex align-items-center gap-2">
                                    <RestaurantIcon sx={{ color: "#D4A574" }} />
                                    Log Food Intake for: {selectedPatient.patientName}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setIsFoodModalOpen(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleSaveFoodIntake} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                                <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>
                                    <div className="mb-4">
                                        <label className="form-label mb-2">Meal Category</label>
                                        <div className="d-flex flex-wrap gap-2">
                                            {["breakfast", "lunch", "dinner", "juice"].map((category) => (
                                                <button
                                                    key={category}
                                                    type="button"
                                                    onClick={() => setActiveCategory(category)}
                                                    className={`btn btn-sm ${
                                                        activeCategory === category
                                                            ? "btn-primary"
                                                            : "btn-outline-secondary"
                                                    }`}
                                                    style={{
                                                        borderRadius: "50px",
                                                        textTransform: "capitalize",
                                                    }}
                                                >
                                                    {category === "juice" ? "Juice / Extras" : category}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label mb-2">Select Food Items</label>
                                        <div
                                            className="border rounded p-3"
                                            style={{ maxHeight: "300px", overflowY: "auto" }}
                                        >
                                            {mockFoodItems[activeCategory]?.length > 0 ? (
                                                mockFoodItems[activeCategory].map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className={`p-2 mb-2 border rounded ${
                                                            selectedFoodItems[item.id] ? "bg-light" : ""
                                                        }`}
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => toggleFoodItem(item.id)}
                                                    >
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                checked={selectedFoodItems[item.id] || false}
                                                                onChange={() => toggleFoodItem(item.id)}
                                                            />
                                                            <label className="form-check-label w-100">
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div>
                                                                        <strong>{item.name}</strong>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            {item.description} • ₹{item.price}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted text-center">No food items available for this category.</p>
                                            )}
                                        </div>
                                    </div>

                                    {selectedFoodCount > 0 && (
                                        <div className="mb-4 p-3 bg-light rounded">
                                            <strong>Selected Items ({selectedFoodCount}):</strong>
                                            <div className="d-flex flex-wrap gap-2 mt-2">
                                                {Object.keys(selectedFoodItems)
                                                    .filter((key) => selectedFoodItems[key])
                                                    .map((itemId) => {
                                                        const item = mockFoodItems[activeCategory]?.find(
                                                            (i) => i.id === itemId
                                                        );
                                                        return item ? (
                                                            <span
                                                                key={itemId}
                                                                className="badge bg-primary"
                                                                style={{ fontSize: "0.875rem", padding: "6px 12px" }}
                                                            >
                                                                {item.name}
                                                            </span>
                                                        ) : null;
                                                    })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label">Additional Notes (optional)</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={additionalNotes}
                                            onChange={(e) => setAdditionalNotes(e.target.value)}
                                            placeholder="Any additional notes or custom items..."
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer" style={{ flexShrink: 0, borderTop: "1px solid #dee2e6" }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsFoodModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        style={{
                                            backgroundColor: "#D4A574",
                                            borderColor: "#D4A574",
                                            color: "#000",
                                        }}
                                    >
                                        Save Intake
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </Box>
    );
}

export default Patient_Monitoring;
