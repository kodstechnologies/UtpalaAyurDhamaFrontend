import { blogimg10, blogimg12, blogimg2, blogimg4, blogimg6, blogimg8 } from "../../components/imagepath";

export default {
    Data: [
        {
            idNo: 1,
            name: "Andrea Lalema",
            mobile: "9875757762",
            email: "andrealalema@gmail.com",
            reasonForConsultation: "Stomach Ache",
            doctorReview: "Take tablets for two days",
            appointments: [
                { date: "2025-02-28", mode: "Walk-In", status: "Completed" },
                { date: "2025-01-25", mode: "Walk-In", status: "Completed" },
            ]
        },
        {
            idNo: 2,
            name: "John Doe",
            mobile: "9123456789",
            email: "johndoe@example.com",
            reasonForConsultation: "Headache",
            doctorReview: "Rest and drink plenty of water",
            appointments: [
                { date: "2025-01-20", mode: "Online", status: "completed" }
            ]
        },
        {
            idNo: 3,
            name: "Maria Spencer",
            mobile: "9456781234",
            email: "marias@example.com",
            reasonForConsultation: "Fever",
            doctorReview: "Take paracetamol every 6 hours",
            appointments: [
                { date: "15-01-2025", mode: "Walk-In", status: "completed" },
                { date: "30-12-2024", mode: "Online", status: "completed" }
            ]
        },
        {
            idNo: 4,
            name: "David Miller",
            mobile: "9876543210",
            email: "david.miller@domain.com",
            reasonForConsultation: "Cold and cough",
            doctorReview: "Use a cough syrup and stay hydrated",
            appointments: [
                { date: "18-01-2025", mode: "Walk-In", status: "completed" }
            ]
        },
        {
            idNo: 5,
            name: "Sophia Johnson",
            mobile: "9345678912",
            email: "sophiajohnson@gmail.com",
            reasonForConsultation: "Back pain",
            doctorReview: "Apply heat pads and avoid heavy lifting",
            appointments: [
                { date: "22-01-2025", mode: "Online", status: "completed" },
                { date: "01-12-2024", mode: "Walk-In", status: "completed" },
                { date: "17-11-2024", mode: "Online", status: "completed" }
            ]
        },
        {
            idNo: 6,
            name: "Michael Brown",
            mobile: "9765432109",
            email: "michael.brown@example.com",
            reasonForConsultation: "Knee pain",
            doctorReview: "Rest and apply ice packs for 15 minutes",
            appointments: [
                { date: "14-01-2025", mode: "Walk-In", status: "completed" },
                { date: "08-12-2024", mode: "Online", status: "completed" }
            ]
        },
        {
            idNo: 7,
            name: "Olivia Clark",
            mobile: "9876123456",
            email: "olivia.clark@domain.com",
            reasonForConsultation: "Fatigue",
            doctorReview: "Ensure proper sleep and take a balanced diet",
            appointments: [
                { date: "10-01-2025", mode: "Walk-In", status: "completed" },
                { date: "20-12-2024", mode: "Online", status: "completed" }
            ]
        }
    ]
}
