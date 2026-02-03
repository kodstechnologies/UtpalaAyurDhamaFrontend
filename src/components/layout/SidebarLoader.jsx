import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Scrollbars from "react-custom-scrollbars-2";
import { useSelector } from "react-redux";

import {
    ChevronDown as ArrowDownIcon,
    ChevronRight as ArrowRightIcon,
    LayoutDashboard as DashboardIcon,
    Stethoscope as MedicalServicesIcon,
    Receipt as ReceiptLongIcon,
    Package as Inventory2Icon,
    UtensilsCrossed as RestaurantMenuIcon,
    BarChart3 as AnalyticsIcon,

    // doctor 
    Users as PeopleIcon,
    Hospital as LocalHospitalIcon,
    HeartPulse as HealingIcon,
    Pill as MedicationIcon,

    // nurse 
    HeartPulse as MonitorHeartIcon,
    ClipboardCheck as AssignmentTurnedInIcon,

    // receptionist 
    Calendar as EventNoteIcon,
    Bed as HotelIcon,
    Building as WardBuildingIcon,
    CreditCard as PaymentsIcon,
    Megaphone as CampaignIcon,
    ClipboardList as AssessmentIcon,

    // therapist 
    Shield as HealthAndSafetyIcon,
    Brain as PsychologyIcon,

    // patient 
    Users as GroupIcon,
    Heart as SpaIcon,
    RotateCw as ReplayIcon,

    // events
    Sparkles as SparklesIcon

} from "lucide-react";

// Sidebar menus configuration
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
                { key: "therapy_view", label: "Therapies", to: "/admin/treatment-therapy" },
                { key: "therapy_assign", label: "Assignments", to: "/admin/treatment-assignments" },
            ],
        },
        {
            key: "consult",
            label: "Consultation",
            icon: <ReceiptLongIcon style={{ color: "var(--color-icons)" }} />,
            children: [
                { key: "slot", label: "Slot", to: "/admin/consultation/slot/view" },
                { key: "fees", label: "Consultation", to: "/admin/consultation/view" },
            ],
        },
        {
            key: "inventory",
            label: "Inventory",
            icon: <Inventory2Icon style={{ color: "var(--color-icons)" }} />,
            children: [
                { key: "inventory_view", label: "Inventory", to: "/admin/inventory/view" },
            ],
        },
        {
            key: "food",
            label: "Food Charges",
            icon: <RestaurantMenuIcon style={{ color: "var(--color-icons)" }} />,
            children: [
                { key: "food_view", label: "Food Charges", to: "/admin/foodcharges/view" },
            ],
        },
        {
            key: "ward",
            label: "Ward Charges",
            icon: <WardBuildingIcon style={{ color: "var(--color-icons)" }} />,
            children: [
                { key: "ward_view", label: "Ward Charges", to: "/admin/ward-charges/view" },
            ],
        },
        {
            key: "Report",
            label: "Reports",
            icon: <AnalyticsIcon style={{ color: "var(--color-icons)" }} />,
            children: [
                { key: "admissions", label: "Admission List", to: "/admin/analytics/admissions" },
                { key: "discharge", label: "Discharge Report", to: "/admin/analytics/discharges" },
                { key: "records", label: "Patient Records", to: "/admin/analytics/patient-records" },
            ],
        },
        {
            key: "swarna_bindu_events",
            label: "Swarna Bindu Events",
            icon: <SparklesIcon style={{ color: "var(--color-icons)" }} />,
            to: "/admin/swarna-bindu-events/view",
        },
    ],
    doctor: [
        {
            key: "dashboard",
            label: "Dashboard",
            icon: <DashboardIcon style={{ color: "var(--color-icons)" }} />,
            to: "/doctor/dashboard",
        },

        /* ================= OP ================= */
        {
            key: "outPatients",
            label: "OP Consultation",
            icon: <LocalHospitalIcon style={{ color: "var(--color-icons)" }} />,
            children: [
                {
                    key: "opConsultation",
                    label: "OP Consultation",
                    to: "/doctor/op-consultation",
                },
                {
                    key: "opdPrescription",
                    label: "OPD Prescription",
                    to: "/doctor/prescriptions",
                },
                {
                    key: "opdTherapies",
                    label: "OPD Therapies",
                    to: "/doctor/opd-therapies",
                },
            ],
        },

        /* ================= IP ================= */
        {
            key: "inPatients",
            label: "In Patients",
            icon: <PeopleIcon style={{ color: "var(--color-icons)" }} />,
            children: [
                {
                    key: "inPatientsList",
                    label: "In Patients",
                    to: "/doctor/in-patients",
                },
                {
                    key: "ipdTherapies",
                    label: "IPD Therapies",
                    to: "/doctor/assign-therapy",
                },
                {
                    key: "ipdPrescriptions",
                    label: "IPD Prescriptions",
                    to: "/doctor/ipd-prescriptions",
                },
            ],
        },

        /* ================= FOLLOW UP ================= */
        {
            key: "followUp",
            label: "Follow-ups",
            icon: <ReplayIcon style={{ color: "var(--color-icons)" }} />,
            to: "/doctor/follow-ups",
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
            icon: <MonitorHeartIcon style={{ color: "var(--color-icons)" }} />,
            to: "/nurse/monitoring",
        },
        {
            key: "dischargePreparation",
            label: "Discharge Preparation",
            icon: <AssignmentTurnedInIcon style={{ color: "var(--color-icons)" }} />,
            to: "/nurse/discharge-preparation",
        }
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
            key: "patient_management",
            label: "Patient Management",
            icon: <PeopleIcon style={{ color: "var(--color-icons)" }} />,
            children: [
                {
                    key: "inpatients",
                    label: "Inpatients",
                    to: "/receptionist/inpatient",
                },
                {
                    key: "outpatients",
                    label: "Outpatients",
                    to: "/receptionist/outpatient",
                },
            ],
        },
        {
            key: "treatments",
            label: "Treatments",
            icon: <LocalHospitalIcon style={{ color: "var(--color-icons)" }} />,
            to: "/receptionist/treatments",
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
        {
            key: "swarna_bindu_events",
            label: "Swarna Bindu Events",
            icon: <SparklesIcon style={{ color: "var(--color-icons)" }} />,
            to: "/receptionist/swarna-bindu-events",
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
                },
                {
                    key: "inpatient",
                    label: "Inpatient",
                    to: "/pharmacist/prescriptions/inpatient",
                },
            ],
        },
        {
            key: "medicines",
            label: "Medicines",
            icon: <MedicationIcon style={{ color: "var(--color-icons)" }} />,
            to: "/pharmacist/medicines",
        },
        {
            key: "inventory",
            label: "Inventory",
            icon: <AssignmentTurnedInIcon style={{ color: "var(--color-icons)" }} />,
            to: "/pharmacist/inventory",
        },
    ],
    therapist: [
        {
            key: "dashboard",
            label: "Dashboard",
            icon: <DashboardIcon style={{ color: "var(--color-icons)" }} />,
            to: "/therapist/dashboard",
        },
        {
            key: "therapyProgress",
            label: "Therapy Progress",
            icon: <PsychologyIcon style={{ color: "var(--color-icons)" }} />,
            to: "/therapist/therapy-progress",
        },
        {
            key: "patientMonitoring",
            label: "Patient Monitoring",
            icon: <HealthAndSafetyIcon style={{ color: "var(--color-icons)" }} />,
            to: "/therapist/patient-monitoring",
        },
        {
            key: "store",
            label: "Store Management",
            icon: <Inventory2Icon style={{ color: "var(--color-icons)" }} />,
            to: "/therapist/store",
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
            key: "followUps",
            label: "My Follow Ups",
            icon: <ReplayIcon style={{ color: "var(--color-icons)" }} />,
            to: "/patient/follow-ups",
        },
        {
            key: "reports",
            label: "Reports",
            icon: <AssessmentIcon style={{ color: "var(--color-icons)" }} />,
            to: "/patient/reports",
        },
    ]
};

// Submenu item list component
const MenuItemList = ({ className = "", items = [], pathname, onNavigate }) => {
    return (
        <ul
            className={`submenu-list ${className}`}
            style={{
                listStyle: "none",
                padding: "4px 0 4px 0",
                margin: 0,
            }}
        >
            {items.map((item) => {
                const isActive = item.to === pathname;

                return (
                    <li
                        key={item.key}
                        className={`submenu-item ${isActive ? "active" : ""}`}
                        style={{
                            listStyle: "none",
                            marginBottom: "2px",
                        }}
                    >
                        <Link
                            to={item.to || "#"}
                            className="submenu-link"
                            onClick={() => {
                                if (onNavigate && item.to) {
                                    onNavigate();
                                }
                            }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "10px 16px 10px 32px",
                                margin: "0 8px",
                                borderRadius: "8px",
                                color: "var(--color-text-side-bar)",
                                textDecoration: "none",
                                fontSize: "13px",
                                transition: "all 0.2s ease",
                                position: "relative",
                                cursor: "pointer",
                                backgroundColor: isActive
                                    ? "var(--color-bg-side-bar-active)"
                                    : "transparent",
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = "var(--color-bg-side-bar-hover)";
                                    e.currentTarget.style.color = "var(--color-text-side-bar-active)";
                                    e.currentTarget.style.paddingLeft = "36px";
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = isActive
                                    ? "var(--color-bg-side-bar-active)"
                                    : "transparent";
                                e.currentTarget.style.color = "var(--color-text-side-bar)";
                                e.currentTarget.style.paddingLeft = "32px";
                            }}
                        >
                            <span
                                className="submenu-dot"
                                style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: "currentColor",
                                    opacity: isActive ? 1 : 0.4,
                                    flexShrink: 0,
                                    transition: "all 0.2s ease",
                                    transform: isActive ? "scale(1.3)" : "scale(1)",
                                }}
                            />
                            <span
                                className="submenu-text"
                                style={{
                                    flex: 1,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    fontWeight: isActive ? 600 : "normal",
                                }}
                            >
                                {item.label}
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
};

// Menu header component (consolidated with wrapper styles)
function MenuHeader({
    id,
    label,
    icon,
    onClick,
    isOpen,
    isCollapsed,
    isActive = false,
    hasChildren = false,
    className = "",
    style = {}
}) {
    const showLabel = !isCollapsed;
    const showArrow = !isCollapsed && hasChildren;
    const effectiveCursor = hasChildren && !isCollapsed ? "pointer" : "default";

    return (
        <div
            id={id}
            className={`menu-header transition-all duration-200 ease-in-out ${className} ${isActive ? 'active' : ''} ${hasChildren ? 'has-children' : ''}`}
            onClick={onClick}
            style={{
                color: "var(--color-text-side-bar)",
                display: "flex",
                alignItems: "center",
                width: "100%",
                textDecoration: "none",
                padding: isCollapsed ? "8px" : "12px 16px",
                margin: "0 8px",
                borderRadius: "10px",
                transition: "all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                position: "relative",
                minHeight: "40px",
                backgroundColor: isActive
                    ? "var(--color-bg-side-bar-active)"
                    : "transparent",
                cursor: effectiveCursor,
                ...style
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-bg-side-bar-hover)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isActive
                    ? "var(--color-bg-side-bar-active)"
                    : "transparent";
            }}
        >
            {/* ICON */}
            <span
                className="header-icon"
                style={{
                    backgroundColor: "var(--color-text-side-bar)",
                    padding: "2px",
                    marginRight: showLabel ? "10px" : "0",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "24px",
                    height: "24px",
                    flexShrink: 0,
                }}
            >
                {icon}
            </span>

            {/* LABEL */}
            {showLabel && (
                <span className="header-label" style={{ flex: 1 }}>
                    {label}
                </span>
            )}

            {/* ARROW */}
            {showArrow && (
                <span
                    className="header-arrow"
                    style={{
                        marginLeft: "auto",
                        opacity: 0.7,
                        transition: "transform 0.2s ease",
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                >
                    {isOpen ? <ArrowDownIcon /> : <ArrowRightIcon />}
                </span>
            )}
        </div>
    );
}

// Core sidebar component
function SidebarComponent({ roleMenu = [], isOpen = true, isMobile = false, onClose }) {
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;
    const [isMobileData, setIsMobileData] = useState(window.innerWidth <= 900);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileData(window.innerWidth <= 900);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Hover state for peek expansion (disabled on mobile)
    const [isHovered, setIsHovered] = useState(false);

    // Memoize initial menus to avoid unnecessary re-renders
    const initialMenus = useMemo(
        () => roleMenu.map((menu) => ({ ...menu, open: false })),
        [roleMenu]
    );

    const [menus, setMenus] = useState(initialMenus);

    // On mobile, always show expanded when open
    const isCollapsed = isMobile ? false : !isOpen;
    const effectiveIsCollapsed = isMobile ? false : (isCollapsed && !isHovered);

    // Reset all submenus when actually collapsing (via toggle)
    useEffect(() => {
        if (isCollapsed) {
            setMenus((prev) => prev.map((m) => ({ ...m, open: false })));
        }
    }, [isCollapsed]);

    // Auto-open active parent when expanded (full or peek) - accordion style: only active open
    useEffect(() => {
        if (!effectiveIsCollapsed) {
            setMenus((prev) =>
                prev.map((m) =>
                    m.children?.some((child) => child.to === pathname)
                        ? { ...m, open: true }
                        : { ...m, open: false }
                )
            );
        }
    }, [pathname, effectiveIsCollapsed]);

    // Auto-open active parent specifically during peek (when collapsed but hovered) - accordion
    useEffect(() => {
        if (isHovered && isCollapsed && roleMenu.some(m => m.children?.some(child => child.to === pathname))) {
            setMenus((prev) =>
                prev.map((m) =>
                    m.children?.some((child) => child.to === pathname)
                        ? { ...m, open: true }
                        : { ...m, open: false }
                )
            );
        }
    }, [isHovered, pathname, isCollapsed, roleMenu]);

    // Reset menus if roleMenu prop changes (e.g., role switch)
    useEffect(() => {
        setMenus(initialMenus);
    }, [initialMenus]);

    const handleHeaderClick = (menu) => {
        if (effectiveIsCollapsed) return;

        // If menu has children → toggle (accordion: close others)
        if (menu.children?.length > 0) {
            setMenus((prev) =>
                prev.map((m) =>
                    m.key === menu.key
                        ? { ...m, open: !m.open }
                        : { ...m, open: false }
                )
            );
            return;
        }

        // If no children → navigate only, close on mobile for top-level leaves
        if (menu.to) {
            navigate(menu.to);
            if (isMobile && onClose) {
                onClose();
            }
        }
    };

    // Sidebar width with smoother transition
    const sidebarWidth = effectiveIsCollapsed ? 60 : 250;
    const transitionDuration = '0.3s';
    const transitionEasing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    const marginLeft = isOpen ? "0" : "-300px";

    return (
        <div
            className="sidebar h-full shadow-md"
            style={{
                width: sidebarWidth,
                minWidth: sidebarWidth,
                transition: `
                    width ${transitionDuration} ${transitionEasing},
                    margin-left ${transitionDuration} ${transitionEasing},
                    background-color ${transitionDuration} ${transitionEasing}
                `,
                overflow: "hidden",
                marginLeft: isMobileData ? marginLeft : "0px",
                backgroundColor: "var(--color-bg-side-bar)",
            }}
            onMouseEnter={() => !isMobile && setIsHovered(true)}
            onMouseLeave={() => !isMobile && setIsHovered(false)}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <Scrollbars
                autoHide
                autoHeight
                autoHeightMax="100vh"
                renderThumbVertical={(props) => (
                    <div
                        {...props}
                        style={{
                            ...props.style,
                            backgroundColor: "var(--color-text-side-bar)",
                            opacity: 0.5,
                            borderRadius: "6px",
                            width: "4px",
                            right: "2px",
                            minHeight: "50px",
                            transition: "opacity 0.2s ease",
                        }}
                    />
                )}
                style={{
                    width: sidebarWidth,
                    transition: `width ${transitionDuration} ${transitionEasing}`,
                }}
            >
                <div className="sidebar-inner">
                    <ul
                        className="menu-list"
                        style={{
                            listStyle: "none",
                            padding: 0,
                            margin: 0,
                            height: "86vh",
                            overflowY: "auto",
                            overflowX: "hidden",
                            paddingTop: "1rem",
                            transition: `padding ${transitionDuration} ${transitionEasing}`,
                        }}
                    >
                        {menus.map((menu) => {
                            const hasChildren = menu.children?.length > 0;
                            const isActive = (menu.to === pathname) || menu.children?.some(child => child.to === pathname);
                            return (
                                <li key={menu.key} className="menu-item" style={{ listStyle: "none", marginBottom: "4px" }}>
                                    {/* HEADER - Render directly */}
                                    <MenuHeader
                                        id={menu.key}
                                        label={menu.label}
                                        icon={menu.icon}
                                        onClick={() => handleHeaderClick(menu)}
                                        isOpen={menu.open}
                                        isCollapsed={effectiveIsCollapsed}
                                        isActive={isActive}
                                        hasChildren={hasChildren}
                                    />
                                    {/* CHILDREN */}
                                    {!effectiveIsCollapsed && hasChildren && (
                                        <div
                                            className={`submenu-wrapper ${menu.open ? 'open' : ''}`}
                                            style={{
                                                maxHeight: menu.open ? "500px" : "0",
                                                overflow: "hidden",
                                                transition: `max-height 0.3s ${transitionEasing}, opacity 0.3s ${transitionEasing}`,
                                                opacity: menu.open ? 1 : 0,
                                                paddingLeft: "16px",
                                            }}
                                        >
                                            <MenuItemList
                                                items={menu.children}
                                                pathname={pathname}
                                                className="text-decoration-none"
                                                onNavigate={undefined}
                                            />
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </Scrollbars>
        </div>
    );
}

// Top-level loader component
function SidebarLoader({ isOpen = true, onClose, isMobile = false }) {
    const role = localStorage.getItem("role") || "admin";
    const menu = sidebarMenus[role?.toLowerCase()] || [];

    const reduxIsOpen = useSelector((state) => state.ui.sidebarOpen);

    return (
        <SidebarComponent
            roleMenu={menu}
            isOpen={isMobile ? (isOpen || reduxIsOpen) : (isOpen || reduxIsOpen)}
            onClose={onClose}
            isMobile={isMobile}
        />
    );
}

export default SidebarLoader;