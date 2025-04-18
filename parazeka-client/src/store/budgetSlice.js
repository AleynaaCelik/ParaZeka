// src/store/budgetSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async (_, { rejectWithValue }) => {
    try {
      // API isteği yapılacak, şimdilik statik veri döndürelim
      return [
        { 
          id: '1', 
          name: 'Gıda Harcamaları', 
          period: 'Nisan 2025',
          amount: 1000,
          spent: 700,
          categoryId: '1'
        },
        { 
          id: '2', 
          name: 'Eğlence', 
          period: 'Nisan 2025',
          amount: 500,
          spent: 425,
          categoryId: '5'
        },
        { 
          id: '3', 
          name: 'Alışveriş', 
          period: 'Nisan 2025',
          amount: 500,
          spent: 550,
          categoryId: '4'
        },
        { 
          id: '4', 
          name: 'Ulaşım', 
          period: 'Nisan 2025',
          amount: 500,
          spent: 200,
          categoryId: '4'
        },
      ];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  budgets: [],
  loading: false,
  error: null,
};

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default budgetSlice.reducer;