import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { logout } from './thunks';

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  isLoading: boolean;
  error: string | undefined | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<FirebaseAuthTypes.User | null>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isLoading = false;
    });
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
