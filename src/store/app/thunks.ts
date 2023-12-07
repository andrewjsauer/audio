import { createAsyncThunk } from '@reduxjs/toolkit';
import auth from '@react-native-firebase/auth';

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await auth().signOut();
});
