import Breadcrumb from '../../components/breadcrumb/Breadcrumb'
import DashboardCard from '../../components/card/DashboardCard'
import GreetingCard from '../../components/card/GreetingCard'
import PeopleIcon from "@mui/icons-material/People";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

function dashboard() {
    // ⭐ Scroll to top on page load

    return (
        <div className='bg-red-400'>

            <Breadcrumb
                items={[
                    { label: "Admin", url: "/admin/dashboard" },
                    {
                        label: "My Dashboard"
                    }
                ]}
            />
            <div style={{ padding: 20 }}>
                <GreetingCard
                    title="Good Morning"
                    message="Wishing you a productive and positive day ahead."
                    image="https://images.unsplash.com/photo-1554224154-22dec7ec8818"
                />

            </div>
            <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
                <DashboardCard
                    title="Users"
                    count={1500}
                    icon={PeopleIcon}
                    iconColor="#3f51b5"
                />

                <DashboardCard
                    title="Orders"
                    count={320}
                    icon={ShoppingCartIcon}
                    iconColor="#e53935"
                />

                <DashboardCard
                    title="Revenue"
                    count={45000}
                    icon={MonetizationOnIcon}
                    iconColor="#43a047"
                />
                <DashboardCard
                    title="Revenue"
                    count={45000}
                    icon={MonetizationOnIcon}
                    iconColor="#43a047"
                />

            </div>

        </div>
    )
}

export default dashboard