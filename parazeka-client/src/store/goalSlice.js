// src/store/goalSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      // API isteği yapılacak, şimdilik statik veri döndürelim
      return [
        { 
          id: '1', 
          name: 'Tatil Fonu', 
          description: 'Yaz tatili için birikim yapıyorum.',
          targetAmount: 10000,
          currentAmount: 6000,
          startDate: '2025-01-01',
          targetDate: '2025-07-01',
          status: 'InProgress'
        },
        { 
          id: '2', 
          name: 'Acil Durum Fonu', 
          description: 'Beklenmeyen durumlar için acil durum fonu.',
          targetAmount: 20000,
          currentAmount: 8000,
          startDate: '2024-10-01',
          targetDate: '2025-10-01',
          status: 'InProgress'
        },
        { 
          id: '3', 
          name: 'Yeni Bilgisayar', 
          description: 'Yeni bilgisayar almak için birikim.',
          targetAmount: 15000,
          currentAmount: 15000,
          startDate: '2024-01-01',
          targetDate: '2025-03-15',
          status: 'Completed'
        },
      ];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  goals: [],
  loading: false,
  error: null,
};

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default goalSlice.reducer;