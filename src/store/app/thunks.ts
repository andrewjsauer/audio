import { createAsyncThunk } from '@reduxjs/toolkit';
import auth from '@react-native-firebase/auth';

export const signOut = createAsyncThunk('app/signOut', async () => {
  await auth().signOut();
});
