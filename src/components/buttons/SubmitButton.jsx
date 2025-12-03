import { Button } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'


function SubmitButton() {
    const Navigate = useNavigate();
    function handleSubmit() {
        Navigate("/admin/dashboard")
    }
    return (
        <Button onClick={handleSubmit} variant="contained">Submit</Button>
    )
}

export default SubmitButton