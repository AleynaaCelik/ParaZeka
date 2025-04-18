// src/api/transactionService.js
import axios from './axiosConfig';

const transactionService = {
  getTransactions: async (params) => {
    return await axios.get('/transactions', { params });
  },
  
  createTransaction: async (transaction) => {
    return await axios.post('/transactions', transaction);
  },
  
  updateTransaction: async (id, transaction) => {
    return await axios.put(`/transactions/${id}`, transaction);
  },
  
  deleteTransaction: async (id) => {
    return await axios.delete(`/transactions/${id}`);
  }
};

export default transactionService;