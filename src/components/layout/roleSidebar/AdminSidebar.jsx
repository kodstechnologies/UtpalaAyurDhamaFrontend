import { Link } from "react-router-dom";
import Scrollbars from "react-custom-scrollbars-2";

import {
    Dashboard as DashboardIcon,
    MedicalServices as MedicalServicesIcon,
    ReceiptLong as ReceiptLongIcon,
    Inventory2 as Inventory2Icon,
    RestaurantMenu as RestaurantMenuIcon,
    Analytics as AnalyticsIcon,
    Logout as LogoutIcon,
} from "@mui/icons-material";
import MenuHeader from "../comonent/MenuHeader";
import MenuItemList from "../comonent/MenuItemList";

function AdminSidebar({ activeClassName }) {
    // Dropdown open/close handler
    const handleClick = (e, item, item1) => {
        const div = document.querySelector(`#${item}`);
        const ulDiv = document.querySelector(`.${item1}`);

        if (!div || !ulDiv) return;

        const isOpen = div.classList.contains("subdrop");

        ulDiv.style.display = isOpen ? "none" : "block";
        div.classList.toggle("subdrop");
    };

    // Admin items
    const adminItems = [
        { key: "dashboard", to: "/admin/dashboard", label: "Dashboard" },
        { key: "doctors", to: "/admin/doctors", label: "Doctors" },
        { key: "nursing", to: "/admin/nursing", label: "Nursing" },
        { key: "receptionists", to: "/admin/receptionists", label: "Receptionists" },
        { key: "pharmacists", to: "/admin/pharmacists", label: "Pharmacists" },
        { key: "therapists", to: "/admin/therapists", label: "Therapists" },
        { key: "patients", to: "/admin/patients", label: "Patients" },
    ];

    // Treatment Therapy items
    const therapyItems = [
        { key: "therapy", to: "/therapist/view", label: "Therapies" },
        { key: "therapy", to: "/therapist/assignments/view", label: "Therapy Assignments" },
    ];

    // Consultation Fees items
    const consultationItems = [
        { key: "addslot", to: "/consultation/slot/view", label: "Slot" },
        { key: "fees", to: "/consultation/view", label: "Consultation" },
    ];

    // Inventory items
    const inventoryItems = [
        { key: "inventory", to: "/inventory/view", label: "Inventory" },
    ];

    // Food Charges items
    const foodItems = [
        { key: "food", to: "/foodcharges/view", label: "Food Charges" },
    ];

    // Analytics items
    const analyticsItems = [
        { key: "admission", to: "/analytics/admissions", label: "Admission List" },
        { key: "dischargeReport", to: "/analytics/discharges", label: "Discharge Report" },
        { key: "patientRecords", to: "/analytics/patient-records", label: "Patient Records" },
    ];

    return (
        <div
            className="sidebar"
            id="sidebar"
            style={{
                backgroundColor: "var(--color-bg-side-bar)",
                color: "var(--color-text-side-bar)",
                borderRight: "1px solid var(--color-border)",

            }}
        >
            <Scrollbars
                autoHide
                autoHideTimeout={800}
                autoHeight
                autoHeightMax="95vh"
                thumbMinSize={30}
            >
                <div className="sidebar-inner slimscroll">
                    <div id="sidebar-menu" className="sidebar-menu">
                        <ul style={{ padding: "10px 0" }}>
                            {/* ------------ ADMIN SECTION ------------ */}
                            <li className="submenu">
                                <MenuHeader
                                    id="menu-item"
                                    label="Admin"
                                    icon={<DashboardIcon style={{ color: "var(--color-icons)" }} />}
                                    onClick={(e) => handleClick(e, "menu-item", "menu-items")}
                                />
                                <MenuItemList
                                    className="menu-items"
                                    items={adminItems}
                                    activeClassName={activeClassName}
                                />
                            </li>

                            {/* ------------ TREATMENT ------------ */}
                            <li className="submenu">
                                <MenuHeader
                                    id="frontoffice"
                                    label="Treatment Therapy"
                                    icon={<MedicalServicesIcon style={{ color: "var(--color-icons)" }} />}
                                    onClick={(e) => handleClick(e, "frontoffice", "frontoffices")}
                                />
                                <MenuItemList
                                    className="frontoffices"
                                    items={therapyItems}
                                    activeClassName={activeClassName}
                                />
                            </li>

                            {/* ------------ CONSULTATION FEES ------------ */}
                            <li className="submenu">
                                <MenuHeader
                                    id="reception-dropmenu"
                                    label="Consultation Fees"
                                    icon={<ReceiptLongIcon style={{ color: "var(--color-icons)" }} />}
                                    onClick={(e) =>
                                        handleClick(e, "reception-dropmenu", "reception-items")
                                    }
                                />
                                <MenuItemList
                                    className="reception-items"
                                    items={consultationItems}
                                    activeClassName={activeClassName}
                                />
                            </li>

                            {/* ------------ INVENTORY ------------ */}
                            <li className="submenu">
                                <MenuHeader
                                    id="pharmacy-menu-item"
                                    label="Inventory"
                                    icon={<Inventory2Icon style={{ color: "var(--color-icons)" }} />}
                                    onClick={(e) =>
                                        handleClick(e, "pharmacy-menu-item", "pharmacy-menu-items")
                                    }
                                />
                                <MenuItemList
                                    className="pharmacy-menu-items"
                                    items={inventoryItems}
                                    activeClassName={activeClassName}
                                />
                            </li>

                            {/* ------------ FOOD CHARGES ------------ */}
                            <li className="submenu">
                                <MenuHeader
                                    id="doctor-dropmenu"
                                    label="Food Charges"
                                    icon={<RestaurantMenuIcon style={{ color: "var(--color-icons)" }} />}
                                    onClick={(e) =>
                                        handleClick(e, "doctor-dropmenu", "doctor-items")
                                    }
                                />
                                <MenuItemList
                                    className="doctor-items"
                                    items={foodItems}
                                    activeClassName={activeClassName}
                                />
                            </li>

                            {/* ------------ ANALYTICS ------------ */}
                            <li className="submenu">
                                <MenuHeader
                                    id="blood-menu-item"
                                    label="Analytics"
                                    icon={<AnalyticsIcon style={{ color: "var(--color-icons)" }} />}
                                    onClick={(e) =>
                                        handleClick(e, "blood-menu-item", "blood-menu-items")
                                    }
                                />
                                <MenuItemList
                                    className="blood-menu-items"
                                    items={analyticsItems}
                                    activeClassName={activeClassName}
                                />
                            </li>
                        </ul>

                        {/* ---------- Logout ---------- */}
                        <div
                            className="logout-btn"
                            style={{
                                marginTop: "20px",
                                padding: "12px 18px",
                            }}
                        >
                            <Link
                                to="/login"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    color: "var(--color-primary)",
                                    fontWeight: 700,
                                }}
                            >
                                <LogoutIcon style={{ color: "var(--color-primary)" }} />
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </Scrollbars>
        </div>
    );
}

export default AdminSidebar;