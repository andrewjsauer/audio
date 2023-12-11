import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { signOut } from './thunks';

interface AppState {
  error: string | undefined | null;
  isLoading: boolean;
  partnersData: object | null;
  user: FirebaseAuthTypes.User | null;
  userData: object | null;
}

const initialState: AppState = {
  error: null,
  isLoading: false,
  partnersData: null,
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
    setPartnersData: (state, action: PayloadAction<object | null>) => {
      state.partnersData = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signOut.fulfilled, (state) => {
      state.isLoading = false;
      state.partnersData = null;
      state.user = null;
      state.userData = null;
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

export const { setError, setUser, setUserData, setPartnersData } =
  appSlice.actions;
export default appSlice.reducer;
