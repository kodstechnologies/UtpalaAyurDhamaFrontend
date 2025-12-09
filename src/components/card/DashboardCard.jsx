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


import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

function DashboardCard({
    title = "Users",
    count,
    description,      // 🆕 optional text
    icon: Icon = null,
}) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (count === undefined || count === null) return;

        const duration = 800;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const value = Math.floor(progress * count);
            setDisplayValue(value);

            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [count]);

    return (
        <Card
            sx={{
                width: 260,
                borderRadius: 4,
                padding: 2,
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
            <CardContent>

                {/* ICON */}
                {Icon && (
                    <Box
                        sx={{
                            width: 55,
                            height: 55,
                            borderRadius: 2,
                            background: "var(--color-bg-header)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 2,
                        }}
                    >
                        <Icon sx={{ fontSize: 32, color: "var(--color-text-header)" }} />
                    </Box>
                )}

                {/* TITLE */}
                <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: "var(--color-text-dark)", mb: 1 }}
                >
                    {title}
                </Typography>

                {/* SHOW COUNT OR TEXT */}
                {count !== undefined && count !== null ? (
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: "var(--color-text-dark)" }}>
                        {displayValue}
                    </Typography>
                ) : description ? (
                    <Typography variant="body1" sx={{ color: "var(--color-text-dark)", fontWeight: 500 }}>
                        {description}
                    </Typography>
                ) : null}

            </CardContent>
        </Card>
    );
}

export default DashboardCard;
