import { createAsyncThunk } from '@reduxjs/toolkit';
// import firebase from '../firebaseConfig';

interface LoginPayload {
  email: string;
  password: string;
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: LoginPayload) => {
    // const response = await firebase
    //   .auth()
    //   .signInWithEmailAndPassword(email, password);
    // return response.user;
    console.log('email', email);
    return null;
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  //   await firebase.auth().signOut();
  console.log('logout');
});
