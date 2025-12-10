// // import React from "react";
// // import { Card, Box, Typography, Button } from "@mui/material";

// // function PatientDashboardCard({
// //     title = "Section Title",
// //     icon: Icon = null,
// //     mainText = "",
// //     subText = "",
// //     showButton = false,
// //     buttonText = "View All",
// //     onButtonClick = () => { },
// // }) {
// //     return (
// //         <Card
// //             sx={{
// //                 padding: "20px",
// //                 borderRadius: "14px",
// //                 boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
// //                 border: "1px solid #e6f4ec",
// //                 background: "#fff",
// //             }}
// //         >
// //             {/* Title */}
// //             <Typography
// //                 variant="h6"
// //                 sx={{ fontWeight: 700, color: "#0d1b2a", mb: 2 }}
// //             >
// //                 {title}
// //             </Typography>

// //             {/* INNER CONTENT CARD */}
// //             <Box
// //                 sx={{
// //                     display: "flex",
// //                     justifyContent: "space-between",
// //                     alignItems: "center",
// //                     background: "#f6fdf9",
// //                     padding: "18px",
// //                     borderRadius: "12px",
// //                     border: "1px solid #d6f3e2",
// //                 }}
// //             >
// //                 {/* Icon + Text */}
// //                 <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
// //                     {/* Optional Icon */}
// //                     {Icon && (
// //                         <Icon sx={{ color: "#4caf50", fontSize: 28 }} />
// //                     )}

// //                     {/* Text Content */}
// //                     <Box>
// //                         {mainText && (
// //                             <Typography
// //                                 variant="subtitle1"
// //                                 sx={{ fontWeight: 600, color: "#0d1b2a" }}
// //                             >
// //                                 {mainText}
// //                             </Typography>
// //                         )}

// //                         {subText && (
// //                             <Typography
// //                                 variant="body2"
// //                                 sx={{ color: "#4a4f55", mt: 0.5 }}
// //                             >
// //                                 {subText}
// //                             </Typography>
// //                         )}
// //                     </Box>
// //                 </Box>

// //                 {/* Optional Button */}
// //                 {showButton && (
// //                     <Button
// //                         variant="outlined"
// //                         size="small"
// //                         onClick={onButtonClick}
// //                         sx={{
// //                             borderColor: "#4caf50",
// //                             color: "#4caf50",
// //                             textTransform: "none",
// //                             fontWeight: 600,
// //                             "&:hover": {
// //                                 borderColor: "#43a047",
// //                                 background: "rgba(76, 175, 80, 0.06)",
// //                             },
// //                         }}
// //                     >
// //                         {buttonText}
// //                     </Button>
// //                 )}
// //             </Box>
// //         </Card>
// //     );
// // }

// // export default PatientDashboardCard;


// import React from "react";
// import { Card, Box, Typography, Button } from "@mui/material";

// function PatientDashboardCard({
//     title = "Section Title",
//     icon: Icon = null,
//     mainText = "",
//     subText = "",
//     showButton = false,
//     buttonText = "View All",
//     onButtonClick = () => { },
// }) {
//     return (
//         <Card
//             sx={{
//                 padding: "20px",
//                 borderRadius: "14px",
//                 background: "var(--color-bg-card)",
//                 border: "1px solid var(--color-border)",
//                 boxShadow: "var(--shadow-medium)",
//             }}
//         >
//             {/* Title */}
//             <Typography
//                 variant="h6"
//                 sx={{
//                     fontWeight: 700,
//                     color: "var(--color-text-dark)",
//                     mb: 2
//                 }}
//             >
//                 {title}
//             </Typography>

//             {/* INNER BOX */}
//             <Box
//                 sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     background: "var(--color-bg-hover)",
//                     padding: "16px",
//                     borderRadius: "12px",
//                     border: "1px solid var(--color-border-dark)",
//                 }}
//             >
//                 {/* Icon + Text */}
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                     {Icon && (
//                         <Icon
//                             sx={{
//                                 color: "var(--color-primary)",  // icon color
//                                 fontSize: 28
//                             }}
//                         />
//                     )}

//                     <Box>
//                         {mainText && (
//                             <Typography
//                                 variant="subtitle1"
//                                 sx={{
//                                     fontWeight: 600,
//                                     color: "var(--color-text-dark)"
//                                 }}
//                             >
//                                 {mainText}
//                             </Typography>
//                         )}

//                         {subText && (
//                             <Typography
//                                 variant="body2"
//                                 sx={{
//                                     color: "var(--color-text-muted)",
//                                     mt: 0.5
//                                 }}
//                             >
//                                 {subText}
//                             </Typography>
//                         )}
//                     </Box>
//                 </Box>

//                 {/* Optional Button */}
//                 {showButton && (
//                     <Button
//                         variant="outlined"
//                         size="small"
//                         onClick={onButtonClick}
//                         sx={{
//                             borderColor: "var(--color-primary)",
//                             color: "var(--color-primary)",
//                             textTransform: "none",
//                             fontWeight: 600,
//                             "&:hover": {
//                                 borderColor: "var(--color-primary-dark)",
//                                 background: "var(--color-bg-hover)"
//                             },
//                         }}
//                     >
//                         {buttonText}
//                     </Button>
//                 )}
//             </Box>
//         </Card>
//     );
// }

// export default PatientDashboardCard;


import React from "react";
import { Card, Box, Typography, Button } from "@mui/material";

function PatientDashboardCard({
    title = "Section Title",
    icon: Icon = null,
    mainText = "",
    subText = "",
    showButton = false,
    buttonText = "View All",
    onButtonClick,
}) {
    return (
        <Card
            sx={{
                padding: "20px",
                borderRadius: "14px",
                background: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-medium)",
            }}
        >
            {/* Title */}
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 700,
                    color: "var(--color-text-dark)",
                    mb: 2,
                }}
            >
                {title}
            </Typography>

            {/* Inner Box */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--color-bg-hover)",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid var(--color-border-dark)",
                }}
            >
                {/* Icon + Text */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {Icon && <Icon sx={{ color: "var(--color-primary)", fontSize: 28 }} />}

                    <Box>
                        {mainText && (
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 600,
                                    color: "var(--color-text-dark)",
                                }}
                            >
                                {mainText}
                            </Typography>
                        )}

                        {subText && (
                            <Typography
                                variant="body2"
                                sx={{
                                    color: "var(--color-text-muted)",
                                    mt: 0.5,
                                }}
                            >
                                {subText}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Button */}
                {showButton && (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={onButtonClick}
                        sx={{
                            borderColor: "var(--color-primary)",
                            color: "var(--color-primary)",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": {
                                borderColor: "var(--color-primary-dark)",
                                background: "var(--color-bg-hover)",
                            },
                        }}
                    >
                        {buttonText}
                    </Button>
                )}
            </Box>
        </Card>
    );
}

export default PatientDashboardCard;
