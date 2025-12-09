// import React, { useEffect, useState } from "react";
// import { Card, CardContent, Typography, Box } from "@mui/material";

// function DashboardCard({
//     title = "Users",
//     count = 100,
//     icon: Icon = null,
//     iconColor = "#3f51b5",
// }) {
//     const [displayValue, setDisplayValue] = useState(0);

//     useEffect(() => {
//         let start = 0;
//         const duration = 800;
//         const startTime = performance.now();

//         const animate = (currentTime) => {
//             const progress = Math.min((currentTime - startTime) / duration, 1);
//             const value = Math.floor(progress * count);
//             setDisplayValue(value);

//             if (progress < 1) requestAnimationFrame(animate);
//         };

//         requestAnimationFrame(animate);
//     }, [count]);

//     return (
//         <Card
//             sx={{
//                 width: 260,
//                 borderRadius: 4,
//                 padding: 2,
//                 background: "var(--color-bg-table)",
//                 boxShadow: "0px 4px 18px rgba(0,0,0,0.08)",
//                 cursor: "pointer",
//                 transition: "0.2s",
//                 "&:hover": {
//                     boxShadow: "0px 6px 22px rgba(0,0,0,0.12)",
//                     transform: "translateY(-3px)",
//                 },
//             }}
//         >
//             <CardContent>

//                 {/* ICON ON TOP */}
//                 {Icon && (
//                     <Box
//                         sx={{
//                             width: 55,
//                             height: 55,
//                             borderRadius: 2,
//                             background: "var(--color-bg-header)",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             mb: 2,
//                         }}
//                     >
//                         <Icon sx={{ fontSize: 32, color: "var(--color-text-header)" }} />
//                     </Box>
//                 )}

//                 {/* Title */}
//                 <Typography
//                     variant="subtitle1"
//                     sx={{ fontWeight: 600, color: "var(--color-text-dark)", mb: 1 }}
//                 >
//                     {title}
//                 </Typography>

//                 {/* Animated Count */}
//                 <Typography
//                     variant="h4"
//                     sx={{
//                         fontWeight: "bold",
//                         color: "var(--color-text-dark)",
//                     }}
//                 >
//                     {displayValue}
//                 </Typography>
//             </CardContent>
//         </Card>
//     );
// }

// export default DashboardCard;


// import React, { useEffect, useState } from "react";
// import { Card, CardContent, Typography, Box } from "@mui/material";

// function DashboardCard({
//     title = "Users",
//     count,          // ❌ removed default
//     icon: Icon = null,
//     // iconColor = "#3f51b5",
// }) {
//     const [displayValue, setDisplayValue] = useState(0);

//     useEffect(() => {
//         if (count === undefined || count === null) return;  // ⛔ no animation if count missing

//         let start = 0;
//         const duration = 800;
//         const startTime = performance.now();

//         const animate = (currentTime) => {
//             const progress = Math.min((currentTime - startTime) / duration, 1);
//             const value = Math.floor(progress * count);
//             setDisplayValue(value);

//             if (progress < 1) requestAnimationFrame(animate);
//         };

//         requestAnimationFrame(animate);
//     }, [count]);

//     return (
//         <Card
//             sx={{
//                 width: 260,
//                 borderRadius: 4,
//                 padding: 2,
//                 background: "var(--color-bg-table)",
//                 boxShadow: "0px 4px 18px rgba(0,0,0,0.08)",
//                 cursor: "pointer",
//                 transition: "0.2s",
//                 "&:hover": {
//                     boxShadow: "0px 6px 22px rgba(0,0,0,0.12)",
//                     transform: "translateY(-3px)",
//                 },
//             }}
//         >
//             <CardContent>
//                 {/* ICON */}
//                 {Icon && (
//                     <Box
//                         sx={{
//                             width: 55,
//                             height: 55,
//                             borderRadius: 2,
//                             background: "var(--color-bg-header)",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             mb: 2,
//                         }}
//                     >
//                         <Icon sx={{ fontSize: 32, color: "var(--color-text-header)" }} />
//                     </Box>
//                 )}

//                 {/* TITLE */}
//                 <Typography
//                     variant="subtitle1"
//                     sx={{ fontWeight: 600, color: "var(--color-text-dark)", mb: 1 }}
//                 >
//                     {title}
//                 </Typography>

//                 {/* ONLY SHOW COUNT WHEN PASSED */}
//                 {count !== undefined && count !== null && (
//                     <Typography
//                         variant="h4"
//                         sx={{ fontWeight: "bold", color: "var(--color-text-dark)" }}
//                     >
//                         {displayValue}
//                     </Typography>
//                 )}
//             </CardContent>
//         </Card>
//     );
// }

// export default DashboardCard;


import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Typography, Box } from "@mui/material";

function DashboardCard({
    title = "Users",
    count,
    description,      // eslint-disable-line no-unused-vars
    icon: Icon = null,
    iconColor = "#3f51b5",  // eslint-disable-line no-unused-vars
    prefix = "",
}) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (count === undefined || count === null) return;

        const duration = 800;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const value = progress * count;
            setDisplayValue(value);

            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [count]);

    return (
        <Card
            sx={{
                width: "100%",
                borderRadius: 4,
                padding: 1.5,
                background: "var(--color-bg-table)",
                boxShadow: "0px 4px 18px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "0.2s",

                "&:hover": {
                    boxShadow: "0px 6px 22px rgba(0,0,0,0.12)",
                    transform: "translateY(-3px)",
                },
            }}
        >
            <CardContent sx={{ padding: "12px !important", "&:last-child": { paddingBottom: "12px" } }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ flex: 1 }}>
                {/* Title */}
                <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, color: "var(--color-text-dark)", mb: 0.5, fontSize: "0.875rem" }}
                >
                    {title}
                </Typography>

                {/* Animated Count */}
                <Typography
                            variant="h5"
                    sx={{
                        fontWeight: "bold",
                        color: "var(--color-text-dark)",
                                fontSize: "1.75rem",
                    }}
                >
                            {prefix}
                            {prefix
                                ? new Intl.NumberFormat("en-IN", {
                                      maximumFractionDigits: 2,
                                      minimumFractionDigits: prefix ? 2 : 0,
                                  }).format(displayValue)
                                : Math.floor(displayValue)}
                </Typography>
                    </Box>

                    {/* ICON ON RIGHT */}
                    {Icon && (
                        <Box
                            sx={{
                                width: 45,
                                height: 45,
                                borderRadius: 2,
                                background: "var(--color-bg-header)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                ml: 2,
                                flexShrink: 0,
                            }}
                        >
                            <Icon sx={{ fontSize: 26, color: "var(--color-text-header)" }} />
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}

DashboardCard.propTypes = {
    title: PropTypes.string,
    count: PropTypes.number,
    description: PropTypes.string,
    icon: PropTypes.elementType,
    iconColor: PropTypes.string,
    prefix: PropTypes.string,
};

export default DashboardCard;
