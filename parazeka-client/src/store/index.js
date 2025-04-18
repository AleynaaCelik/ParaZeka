// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import transactionReducer from './transactionSlice';
import accountReducer from './accountSlice';
import categoryReducer from './categorySlice';
import budgetReducer from './budgetSlice';
import goalReducer from './goalSlice';

export const store = configureStore({
  reducer: {
    transactions: transactionReducer,
    accounts: accountReducer,
    categories: categoryReducer,
    budgets: budgetReducer,
    goals: goalReducer,
  },
});

export default store;