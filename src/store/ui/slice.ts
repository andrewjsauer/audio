import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notification: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.notification = { ...action.payload };
    },
    hideNotification: (state) => {
      state.notification = null;
    },
  },
});

export const { showNotification, hideNotification } = uiSlice.actions;

export default uiSlice.reducer;
