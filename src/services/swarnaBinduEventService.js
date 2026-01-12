import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api";

const swarnaBinduEventService = {
    // Get all events with pagination and filters
    getAllEvents: async (params = {}) => {
        try {
            const response = await axios.get(getApiUrl("swarna-bindu-events"), {
                headers: getAuthHeaders(),
                params,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get events by date range (for calendar)
    getEventsByDateRange: async (startDate, endDate) => {
        try {
            const response = await axios.get(getApiUrl("swarna-bindu-events/calendar"), {
                headers: getAuthHeaders(),
                params: { startDate, endDate },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get a single event by ID
    getEventById: async (id) => {
        try {
            const response = await axios.get(getApiUrl(`swarna-bindu-events/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create a new event
    createEvent: async (eventData) => {
        try {
            const response = await axios.post(
                getApiUrl("swarna-bindu-events"),
                eventData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update an existing event
    updateEvent: async (id, eventData) => {
        try {
            const response = await axios.patch(
                getApiUrl(`swarna-bindu-events/${id}`),
                eventData,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update event status
    updateEventStatus: async (id, isActive) => {
        try {
            const response = await axios.patch(
                getApiUrl(`swarna-bindu-events/${id}/status`),
                { isActive },
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete an event
    deleteEvent: async (id) => {
        try {
            const response = await axios.delete(getApiUrl(`swarna-bindu-events/${id}`), {
                headers: getAuthHeaders(),
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default swarnaBinduEventService;

