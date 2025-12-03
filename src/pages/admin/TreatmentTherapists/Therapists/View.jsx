import React from 'react';
import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb';
import TableComponent from '../../../../components/table/TableComponent';
import HeadingCard from '../../../../components/card/HeadingCard';

function Therapists_View() {

    const columns = [
        { field: "therapyName", header: "Therapy Name" },
        { field: "cost", header: "Cost" },
        { field: "description", header: "Description" },
    ];

    const rows = [
        {
            _id: "1",
            therapyName: "Abhyanga Massage",
            cost: "₹1500",
            description: "Full-body warm oil massage therapy",
        },
        {
            _id: "2",
            therapyName: "Shirodhara",
            cost: "₹2000",
            description: "Warm oil therapy for stress relief",
        },
    ];

    return (
        <div>
            <Breadcrumb
                items={[
                    { label: "Admin", url: "/admin/dashboard" },
                    { label: "Treatment & Therapy" },
                    { label: "Therapy Scheduling & Pricing" }
                ]}
            />
            {/* 
            <HeadingCard
                category="TREATMENT & THERAPY"
                title="Therapy Scheduling & Pricing"
                subtitle="Manage therapy schedules, assign trained specialists, and maintain transparent pricing for patient care and billing."
            /> */}

            {/* UPDATED TABLE */}
            <TableComponent
                title="Therapy List"
                columns={columns}
                rows={rows}
            />
        </div>
    );
}

export default Therapists_View;
