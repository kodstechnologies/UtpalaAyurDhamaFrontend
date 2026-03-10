// import React, { useState } from "react";
// import { Box } from "@mui/material";
// import { useParams, useNavigate } from "react-router-dom";
// import HeadingCard from "../../../components/card/HeadingCard";
// import SubmitButton from "../../../components/buttons/SubmitButton";

// // Icons (MUI)
// import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
// import EventIcon from "@mui/icons-material/Event";
// import Inventory2Icon from "@mui/icons-material/Inventory2";
// import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
// import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

// // Mock API
// const createBatchAPI = async (data) => {
//     console.log("Created Batch:", data);
//     return true;
// };

// function Batch_Log_Add() {
//     const { stockId } = useParams();
//     const navigate = useNavigate();

//     // Mock item name
//     const itemName = "Ashwagandha churna";

//     const [batchNumber, setBatchNumber] = useState("");
//     const [manufactureDate, setManufactureDate] = useState("");
//     const [expiryDate, setExpiryDate] = useState("");
//     const [quantity, setQuantity] = useState("");
//     const [costPrice, setCostPrice] = useState("");
//     const [sellPrice, setSellPrice] = useState("");
//     const [details, setDetails] = useState("");
//     const [isLoading, setIsLoading] = useState(false);

//     const handleSubmit = async () => {
//         if (!batchNumber || !manufactureDate || !expiryDate || !quantity || !costPrice || !sellPrice) {
//             alert("Please fill all required fields");
//             return;
//         }

//         setIsLoading(true);
//         try {
//             const payload = {
//                 stockId,
//                 itemName,
//                 batchNumber,
//                 manufactureDate,
//                 expiryDate,
//                 quantity: Number(quantity),
//                 costPrice: Number(costPrice),
//                 sellPrice: Number(sellPrice),
//                 details,
//             };
//             await createBatchAPI(payload);
//             alert("Batch added successfully");
//             navigate(`/admin/inventory/batch-log/${stockId}`);
//         } catch (error) {
//             console.error("Error adding batch:", error);
//             alert("Failed to add batch. Please try again.");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <Box sx={{ p: 3 }}>

//             {/* PAGE HEADER */}
//             <HeadingCard
//                 title={`Add New Batch for: ${itemName}`}
//                 subtitle="Add a new batch entry for the inventory item"
//                 breadcrumbItems={[
//                     { label: "Admin", path: "/admin/dashboard" },
//                     { label: "Inventory", path: "/admin/inventory" },
//                     { label: "Batch Log", path: `/admin/inventory/batch-log/${stockId}` },
//                     { label: "Add Batch" },
//                 ]}
//             />

//             {/* FORM CARD */}
//             <Box
//                 sx={{
//                     backgroundColor: "var(--color-bg-card)",
//                     borderRadius: 4,
//                     p: 4,
//                     border: "1px solid var(--color-border)",
//                     boxShadow: "var(--shadow-medium)",
//                 }}
//             >
//                 {/* BATCH NUMBER */}
//                 <Box sx={{ mb: 3 }}>
//                     <label className="flex items-center gap-2 font-semibold mb-1">
//                         <ConfirmationNumberIcon fontSize="small" />
//                         Batch Number <span className="text-red-600">*</span>
//                     </label>
//                     <input
//                         type="text"
//                         placeholder="Enter batch number"
//                         value={batchNumber}
//                         onChange={(e) => setBatchNumber(e.target.value)}
//                         className="w-full p-3 border rounded-lg"
//                         disabled={isLoading}
//                     />
//                 </Box>

//                 {/* MANUFACTURE DATE */}
//                 <Box sx={{ mb: 3 }}>
//                     <label className="flex items-center gap-2 font-semibold mb-1">
//                         <EventIcon fontSize="small" />
//                         Manufacture Date <span className="text-red-600">*</span>
//                     </label>
//                     <input
//                         type="date"
//                         value={manufactureDate}
//                         onChange={(e) => setManufactureDate(e.target.value)}
//                         className="w-full p-3 border rounded-lg"
//                         disabled={isLoading}
//                     />
//                 </Box>

//                 {/* EXPIRY DATE */}
//                 <Box sx={{ mb: 3 }}>
//                     <label className="flex items-center gap-2 font-semibold mb-1">
//                         <EventIcon fontSize="small" />
//                         Expiry Date <span className="text-red-600">*</span>
//                     </label>
//                     <input
//                         type="date"
//                         value={expiryDate}
//                         onChange={(e) => setExpiryDate(e.target.value)}
//                         className="w-full p-3 border rounded-lg"
//                         disabled={isLoading}
//                     />
//                 </Box>

//                 {/* QUANTITY TO ADD */}
//                 <Box sx={{ mb: 3 }}>
//                     <label className="flex items-center gap-2 font-semibold mb-1">
//                         <Inventory2Icon fontSize="small" />
//                         Quantity to Add <span className="text-red-600">*</span>
//                     </label>
//                     <input
//                         type="number"
//                         placeholder="Enter quantity"
//                         value={quantity}
//                         onChange={(e) => setQuantity(e.target.value)}
//                         className="w-full p-3 border rounded-lg"
//                         disabled={isLoading}
//                     />
//                 </Box>

//                 {/* COST PRICE */}
//                 <Box sx={{ mb: 3 }}>
//                     <label className="flex items-center gap-2 font-semibold mb-1">
//                         <AttachMoneyIcon fontSize="small" />
//                         Cost Price (₹) <span className="text-red-600">*</span>
//                     </label>
//                     <input
//                         type="number"
//                         placeholder="Enter cost price"
//                         value={costPrice}
//                         onChange={(e) => setCostPrice(e.target.value)}
//                         className="w-full p-3 border rounded-lg"
//                         disabled={isLoading}
//                     />
//                 </Box>

//                 {/* SELL PRICE */}
//                 <Box sx={{ mb: 3 }}>
//                     <label className="flex items-center gap-2 font-semibold mb-1">
//                         <AttachMoneyIcon fontSize="small" />
//                         Sell Price (₹) <span className="text-red-600">*</span>
//                     </label>
//                     <input
//                         type="number"
//                         placeholder="Enter sell price"
//                         value={sellPrice}
//                         onChange={(e) => setSellPrice(e.target.value)}
//                         className="w-full p-3 border rounded-lg"
//                         disabled={isLoading}
//                     />
//                 </Box>

//                 {/* DETAILS / REMARKS */}
//                 <Box sx={{ mb: 4 }}>
//                     <label className="flex items-center gap-2 font-semibold mb-1">
//                         <DescriptionOutlinedIcon fontSize="small" />
//                         Details / Remarks
//                     </label>
//                     <textarea
//                         rows={4}
//                         placeholder="Enter details or remarks"
//                         value={details}
//                         onChange={(e) => setDetails(e.target.value)}
//                         className="w-full p-3 border rounded-lg resize-none"
//                         disabled={isLoading}
//                     />
//                 </Box>

//                 {/* ACTION BUTTONS */}
//                 <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
//                     <button
//                         onClick={() => navigate(`/admin/inventory/batch-log/${stockId}`)}
//                         className="px-6 py-2 border rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-100"
//                         disabled={isLoading}
//                     >
//                         ✕ Cancel
//                     </button>

//                     <SubmitButton
//                         text={isLoading ? "Adding..." : "Add"}
//                         onClick={handleSubmit}
//                         disabled={isLoading}
//                     />
//                 </Box>

//                 {/* FOOTER NOTE */}
//                 <p className="mt-4 text-sm text-[var(--color-text-muted)] flex items-center gap-2">
//                     <span className="text-red-500">●</span>
//                     Required fields are marked with an asterisk (*). All changes will be saved upon submission.
//                 </p>
//             </Box>
//         </Box>
//     );
// }

// export default Batch_Log_Add;

import { useState } from "react";
import { Box, TextField, Button, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HeadingCard from "../../../components/card/HeadingCard";
import SubmitButton from "../../../components/buttons/SubmitButton";

function Batch_Log_Add() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        batchNumber: "",
        manufactureDate: "",
        expiryDate: "",
        quantityToAdd: "",
        costPrice: "",
        sellPrice: "",
        details: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.batchNumber || !formData.manufactureDate || !formData.expiryDate || !formData.quantityToAdd || !formData.costPrice || !formData.sellPrice) {
            alert("Please fill all required fields");
            return;
        }

        console.log("SUBMITTED PAYLOAD 👉", formData);
        alert("Batch added successfully");
        navigate("/admin/inventory/view");
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* HEADER */}
            <HeadingCard
                title="Add New Batch for: Ashwagandha churna"
                subtitle="Add a new batch to the inventory system."
                breadcrumbItems={[
                    { label: "Admin", path: "/admin/dashboard" },
                    { label: "Inventory", path: "/admin/inventory/view" },
                    { label: "Add Batch" },
                ]}
            />

            {/* MAIN FORM */}
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    backgroundColor: "var(--color-bg-card)",
                    borderRadius: 4,
                    p: 4,
                    border: "1px solid var(--color-border)",
                    boxShadow: "var(--shadow-medium)",
                    mt: 3,
                }}
            >
                <Grid container spacing={3}>
                    {/* Batch Number */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Batch Number <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="batchNumber"
                            value={formData.batchNumber}
                            onChange={handleInputChange}
                            placeholder="Enter batch number"
                            required
                        />
                    </Grid>

                    {/* Manufacture Date */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Manufacture Date <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="manufactureDate"
                            type="date"
                            value={formData.manufactureDate}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    {/* Expiry Date */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Expiry Date <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="expiryDate"
                            type="date"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    {/* Quantity to Add */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Quantity to Add <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="quantityToAdd"
                            type="number"
                            value={formData.quantityToAdd}
                            onChange={handleInputChange}
                            placeholder="Enter quantity"
                            inputProps={{ min: 0 }}
                            required
                        />
                    </Grid>

                    {/* Cost Price */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Cost Price <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="costPrice"
                            type="number"
                            value={formData.costPrice}
                            onChange={handleInputChange}
                            placeholder="Enter cost price"
                            inputProps={{ min: 0, step: "0.01" }}
                            required
                        />
                    </Grid>

                    {/* Sell Price */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Sell Price <span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                            fullWidth
                            name="sellPrice"
                            type="number"
                            value={formData.sellPrice}
                            onChange={handleInputChange}
                            placeholder="Enter sell price"
                            inputProps={{ min: 0, step: "0.01" }}
                            required
                        />
                    </Grid>

                    {/* Details / Remarks */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                            Details / Remarks
                        </Typography>
                        <TextField
                            fullWidth
                            name="details"
                            multiline
                            rows={4}
                            value={formData.details}
                            onChange={handleInputChange}
                            placeholder="Enter details or remarks"
                        />
                    </Grid>
                </Grid>

                {/* ACTIONS */}
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate("/admin/inventory/view")}
                        sx={{ mr: 2 }}
                    >
                        Cancel
                    </Button>
                    <SubmitButton
                        text="Add"
                        type="submit"
                    />
                </Box>
            </Box>
        </Box>
    );
}

export default Batch_Log_Add;