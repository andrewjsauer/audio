import { createAsyncThunk } from '@reduxjs/toolkit';
import auth from '@react-native-firebase/auth';

export const logout = createAsyncThunk('auth/logout', async () => {
  await auth().signOut();
});
