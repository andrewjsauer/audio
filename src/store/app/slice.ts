import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { signOut } from './thunks';

interface AppState {
  user: FirebaseAuthTypes.User | null;
  userData: object | null;
  isLoading: boolean;
  error: string | undefined | null;
}

const initialState: AppState = {
  error: null,
  isLoading: false,
  user: null,
  userData: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<FirebaseAuthTypes.User | null>) => {
      state.user = action.payload;
    },
    setUserData: (state, action: PayloadAction<object | null>) => {
      state.userData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signOut.fulfilled, (state) => {
      state.user = null;
      state.isLoading = false;
    });
    builder.addCase(signOut.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(signOut.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    });
  },
});

export const { setUser, setUserData } = appSlice.actions;
export default appSlice.reducer;
