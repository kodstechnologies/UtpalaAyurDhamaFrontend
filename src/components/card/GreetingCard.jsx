// import React from "react";
// import { Card, CardContent, Typography, Box } from "@mui/material";

// export default function GreetingBanner({
//     title = "Good Morning",
//     name = "Admin",
//     subtitle = "Have a nice day at work",
//     image = "/assets/greeting.png" // default image if you want
// }) {
//     return (
//         <Card
//             sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 borderRadius: 3,
//                 padding: 3,
//                 backgroundColor: "var(--color-bg-table)",
//                 boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
//                 height: "13rem",
//                 overflow: "hidden",
//             }}
//         >
//             {/* LEFT SIDE */}
//             <CardContent sx={{ flex: 1 }}>
//                 <Typography
//                     variant="h5"
//                     sx={{ fontWeight: 700, color: "var(--color-text-dark)", mb: 1 }}
//                 >
//                     {title},{" "}
//                     <span style={{ color: "var(--color-icons)" }}>
//                         {name}
//                     </span>
//                 </Typography>

//                 <Typography variant="body1" sx={{ color: "var(--color-text-dark)" }}>
//                     {subtitle}
//                 </Typography>
//             </CardContent>

//             {/* RIGHT SIDE IMAGE (optional) */}
//             {image && (
//                 <Box
//                     component="img"
//                     src={image}
//                     alt="illustration"
//                     sx={{
//                         width: 260,
//                         height: "auto",
//                         objectFit: "contain",
//                         ml: 2,
//                     }}
//                 />
//             )}
//         </Card>
//     );
// }


import PropTypes from "prop-types";
import { Card, CardContent, Typography, Box } from "@mui/material";
import Breadcrumb from "../breadcrumb/Breadcrumb"; // ⭐ import breadcrumb here

export default function GreetingBanner({
    title = "Good Morning",
    name = "Admin",
    subtitle = "Have a nice day at work",
    image = "/assets/greeting.png",
    breadcrumbItems = []   // ⭐ accept breadcrumb items
}) {
    return (
        <Card
            sx={{
                borderRadius: 3,
                padding: 3,
                backgroundColor: "var(--color-bg-table)",
                boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
                height: "13rem",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
            }}
        >
            {/* ⭐ Breadcrumb inside */}
            <Breadcrumb items={breadcrumbItems} style={{ marginBottom: "10px" }} />

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {/* LEFT SIDE */}
                <CardContent sx={{ flex: 1, padding: 0 }}>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: "var(--color-text-dark)", mb: 1 }}
                    >
                        {title},{" "}
                        <span style={{ color: "var(--color-icons)" }}>{name}</span>
                    </Typography>

                    <Typography variant="body1" sx={{ color: "var(--color-text-dark)" }}>
                        {subtitle}
                    </Typography>
                </CardContent>

                {/* RIGHT SIDE IMAGE */}
                {image && (
                    <Box
                        component="img"
                        src={image}
                        alt="illustration"
                        sx={{
                            width: 260,
                            height: "auto",
                            objectFit: "contain",
                            ml: 2,
                        }}
                    />
                )}
            </Box>
        </Card>
    );
}

GreetingBanner.propTypes = {
    title: PropTypes.string,
    name: PropTypes.string,
    subtitle: PropTypes.string,
    image: PropTypes.string,
    breadcrumbItems: PropTypes.array,
};
