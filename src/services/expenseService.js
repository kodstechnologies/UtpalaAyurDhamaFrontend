import axios from "axios";
import { getApiUrl, getAuthHeaders } from "../config/api.js";

const expenseService = {
  // ✅ GET all product names
  getProductNames: async (params = {}) => {
    try {
      const response = await axios.get(
        getApiUrl("expense/product-name"),
        {
          headers: getAuthHeaders(),
          params,
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ✅ CREATE product name
  createProductName: async (data) => {
    try {
      const response = await axios.post(
        getApiUrl("expense/product-name"),
        data,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ✅ UPDATE product name
  updateProductName: async (id, data) => {
    try {
      const response = await axios.patch(
        getApiUrl(`expense/product-name/${id}`),
        data,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ✅ DELETE product name
  deleteProductName: async (id) => {
    try {
      const response = await axios.delete(
        getApiUrl(`expense/product-name/${id}`),
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ✅ GET expenses by date
  getExpensesByDate: async (date) => {
    try {
      const response = await axios.get(
        getApiUrl("expense/expenseItem"),
        {
          headers: getAuthHeaders(),
          params: { date }, // ?date=2026-03-26
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ✅ CREATE expense item
  createExpenseItem: async (data) => {
    try {
      const response = await axios.post(
        getApiUrl("expense/expenseItem"),
        data,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ✅ UPDATE expense item
  updateExpenseItem: async (id, data) => {
    try {
      const response = await axios.patch(
        getApiUrl(`expense/expenseItem/${id}`),
        data,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ✅ DELETE expense item
  deleteExpenseItem: async (id) => {
    try {
      const response = await axios.delete(
        getApiUrl(`expense/expenseItem/${id}`),
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  } 

};

export default expenseService;