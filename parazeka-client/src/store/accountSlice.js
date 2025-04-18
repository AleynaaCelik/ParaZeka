// src/store/accountSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      // API isteği yapılacak, şimdilik statik veri döndürelim
      return [
        {
          id: '1',
          name: 'İş Bankası Hesabı',
          accountType: 'Vadesiz Hesap',
          accountNumber: 'TR12 3456 7890 1234 5678 90',
          balance: 3250,
        },
        {
          id: '2',
          name: 'Garanti Bonus Kart',
          accountType: 'Kredi Kartı',
          accountNumber: '**** **** **** 5678',
          balance: -1500,
        },
        {
          id: '3',
          name: 'Akbank Tasarruf',
          accountType: 'Birikim Hesabı',
          accountNumber: 'TR98 7654 3210 9876 5432 10',
          balance: 2500,
        },
      ];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  accounts: [],
  loading: false,
  error: null,
};

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default accountSlice.reducer;