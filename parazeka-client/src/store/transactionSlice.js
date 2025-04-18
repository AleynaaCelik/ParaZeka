// src/store/transactionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from '../api/transactionService';

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transaction, { rejectWithValue }) => {
    try {
      const response = await transactionService.createTransaction(transaction);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Diğer thunk'lar (update, delete) burada tanımlanabilir

const initialState = {
  transactions: [],
  loading: false,
  error: null,
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setPageNumber: (state, action) => {
      state.pageNumber = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.totalCount = action.payload.totalCount;
        state.pageNumber = action.payload.pageNumber;
        state.pageSize = action.payload.pageSize;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Bir hata oluştu';
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        // Burada state'i güncelleyebilirsiniz, ancak genellikle
        // yeni bir fetchTransactions çağrısı yapmak daha iyidir
      });
  },
});

export const { setPageNumber } = transactionSlice.actions;
export default transactionSlice.reducer;