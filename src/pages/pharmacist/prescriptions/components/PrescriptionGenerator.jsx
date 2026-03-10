import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PrescriptionGenerator = () => {

    const { state } = useLocation();

    const { patient, prescriptions, examination } = state || {};

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return "";
        const dob = new Date(dateOfBirth);
        const diff = Date.now() - dob.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    useEffect(() => {
        setTimeout(() => {
            window.print();
        }, 500);
    }, []);

    if (!patient) return null;

    return (
        <div style={{ padding: 40 }}>

            <h2 style={{ textAlign: "center" }}>Prescription</h2>

            <p><b>Patient:</b> {patient?.user?.name}</p>
            <p><b>UHID:</b> {patient?.user?.uhid}</p>
            <p><b>Age:</b> {calculateAge(patient?.dateOfBirth)}</p>
            <p><b>Doctor:</b> {prescriptions?.[0]?.doctor?.user?.name}</p>
            <p><b>Date:</b> {formatDate(examination?.createdAt)}</p>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
                <thead>
                    <tr>
                        <th style={th}>Medicine</th>
                        <th style={th}>Dosage</th>
                        <th style={th}>Frequency</th>
                        <th style={th}>Duration</th>
                        <th style={th}>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {prescriptions?.map((p) => (
                        <tr key={p._id}>
                            <td style={td}>{p.medication}</td>
                            <td style={td}>{p.dosage}</td>
                            <td style={td}>{p.frequency}</td>
                            <td style={td}>{p.duration}</td>
                            <td style={td}>{p.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
};

const th = {
    border: "1px solid black",
    padding: "8px"
};

const td = {
    border: "1px solid black",
    padding: "8px"
};

export default PrescriptionGenerator;