// src/store/categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      // API isteği yapılacak, şimdilik statik veri döndürelim
      return [
        { id: '1', name: 'Gıda', color: '#4CAF50', icon: 'food' },
        { id: '2', name: 'Maaş', color: '#2196F3', icon: 'salary' },
        { id: '3', name: 'Faturalar', color: '#F44336', icon: 'bill' },
        { id: '4', name: 'Ulaşım', color: '#FF9800', icon: 'transport' },
        { id: '5', name: 'Eğlence', color: '#9C27B0', icon: 'entertainment' },
      ];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  categories: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;