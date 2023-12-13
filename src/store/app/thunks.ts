import { createAsyncThunk } from '@reduxjs/toolkit';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { fetchPartnerData } from '@store/partnership/thunks';
import { updateUser } from '@store/auth/thunks';

export const signOut = createAsyncThunk(
  'app/signOut',
  async (userId: string, { dispatch }) => {
    if (userId) {
      dispatch(
        updateUser({
          id: userId,
          userDetails: {
            lastActiveAt: firestore.FieldValue.serverTimestamp(),
          },
        }),
      );
    }

    await auth().signOut();
  },
);

export const initializeSession = createAsyncThunk(
  'app/initializeSession',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      await dispatch(fetchPartnerData(userId));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);
