// src/store/transactionSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Asenkron işlemleri tanımlama
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params, { rejectWithValue }) => {
    try {
      // API isteği yapılacak, şimdilik statik veri döndürelim
      return {
        transactions: [
          {
            id: '1',
            transactionDate: '2025-04-15',
            description: 'Market Alışverişi',
            categoryName: 'Gıda',
            categoryId: '1',
            accountId: '1',
            accountName: 'Vadesiz Hesap',
            amount: 250,
            type: 'Expense',
          },
          {
            id: '2',
            transactionDate: '2025-04-14',
            description: 'Maaş',
            categoryName: 'Maaş',
            categoryId: '2',
            accountId: '1',
            accountName: 'Vadesiz Hesap',
            amount: 6500,
            type: 'Income',
          },
          {
            id: '3',
            transactionDate: '2025-04-10',
            description: 'Elektrik Faturası',
            categoryName: 'Faturalar',
            categoryId: '3',
            accountId: '2',
            accountName: 'Kredi Kartı',
            amount: 320,
            type: 'Expense',
          },
        ],
        totalCount: 3,
        pageNumber: 1,
        pageSize: 10,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transaction, { rejectWithValue }) => {
    try {
      // API isteği yapılacak, şimdilik başarılı yanıt döndürelim
      return { id: Date.now().toString(), ...transaction };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id, { rejectWithValue }) => {
    try {
      // API isteği yapılacak, şimdilik başarılı yanıt döndürelim
      return { id };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

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
        state.error = action.payload;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        // Yeni işlemi ekle
        state.transactions.push(action.payload);
        state.totalCount += 1;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        // İşlemi sil
        state.transactions = state.transactions.filter(t => t.id !== action.payload.id);
        state.totalCount -= 1;
      });
  },
});

export const { setPageNumber } = transactionSlice.actions;
export default transactionSlice.reducer;