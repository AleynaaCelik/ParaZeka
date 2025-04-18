// src/api/accountService.js
import axios from './axiosConfig';

const accountService = {
  getAccounts: async () => {
    return await axios.get('/accounts');
  },
  
  createAccount: async (account) => {
    return await axios.post('/accounts', account);
  },
  
  updateAccount: async (id, account) => {
    return await axios.put(`/accounts/${id}`, account);
  },
  
  deleteAccount: async (id) => {
    return await axios.delete(`/accounts/${id}`);
  }
};

export default accountService;