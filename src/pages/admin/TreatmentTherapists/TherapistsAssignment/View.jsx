import React from 'react'
import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb'
import HeadingCard from '../../../../components/card/HeadingCard'
import TableComponent from '../../../../components/table/TableComponent'

function Therapists_Assignment_View() {

    // TABLE COLUMNS
    const columns = [
        { field: "therapyType", header: "Therapy Type" },
        { field: "therapist", header: "Therapist" },
        { field: "cost", header: "Cost" },
    ];

    // SAMPLE ROWS
    const rows = [
        {
            _id: "1",
            therapyType: "Abhyanga",
            therapist: "Rahul Verma",
            cost: "₹1,200"
        },
        {
            _id: "2",
            therapyType: "Shirodhara",
            therapist: "Meera Nair",
            cost: "₹1,500"
        },
        {
            _id: "3",
            therapyType: "Pizhichil",
            therapist: "Arun Kumar",
            cost: "₹2,000"
        }
    ];

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Treatment & Therapy" },
                    { label: "Therapists Assignment" }
                ]}
            />

            {/* <HeadingCard
                category="TREATMENT & THERAPY"
                title="Therapists Assignment"
                subtitle="Assign qualified therapists to individual therapies, manage their availability, and ensure smooth coordination for treatment delivery."
            /> */}

            {/* TABLE */}
            <TableComponent
                title="Therapists Assignment List"
                columns={columns}
                rows={rows}
            />
        </div>
    )
}

export default Therapists_Assignment_View
