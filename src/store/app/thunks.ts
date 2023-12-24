import { createAsyncThunk } from '@reduxjs/toolkit';

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import Purchases from 'react-native-purchases';

import { Platform } from 'react-native';
import Config from 'react-native-config';

import { trackEvent } from '@lib/analytics';

import { updateUser } from '@store/auth/thunks';
import { UserDataType } from '@lib/types';

export const signOut = createAsyncThunk(
  'app/signOut',
  async (
    {
      userId,
      isDelete,
    }: {
      userId: string;
      isDelete?: boolean;
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      if (userId && !isDelete) {
        dispatch(
          updateUser({
            id: userId,
            userDetails: {
              lastActiveAt: firestore.Timestamp.now(),
            },
          }),
        );
      }

      if (auth().currentUser) {
        await auth().signOut();
      }

      if (!Purchases.isConfigured) {
        await Purchases.logOut();
      }

      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const initializeSession = createAsyncThunk(
  'app/initializeSession',
  async (user: FirebaseAuthTypes.User, { rejectWithValue }) => {
    try {
      if (__DEV__) Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

      Purchases.configure({
        apiKey:
          Platform.OS === 'ios'
            ? (Config.revenueCatiOSKey as string)
            : (Config.revenueCatAndroidKey as string),
        appUserID: user.uid,
        observerMode: false,
        useAmazon: false,
      });

      const appInstanceId = await analytics().getAppInstanceId();
      Purchases.setAttributes({
        $firebaseAppInstanceId: appInstanceId,
      });

      const customerUserDocRef = firestore().collection('customers').doc(user.uid);
      const customerUserDoc = await customerUserDocRef.get();

      if (customerUserDoc.exists) {
        trackEvent('customer_user_found');
        return true;
      }

      trackEvent('customer_user_not_found');
      return false;
    } catch (error) {
      crashlytics().log('Error initializing session');
      trackEvent('error_initializing_session', { error });

      return rejectWithValue(error.message);
    }
  },
);

export const purchaseProduct = createAsyncThunk(
  'app/purchaseProduct',
  async (
    {
      user,
      partnerData,
    }: {
      user: FirebaseAuthTypes.User;
      partnerData?: UserDataType;
    },
    { rejectWithValue },
  ) => {
    try {
      await Purchases.purchaseProduct('yf_1799_1m_1m0');

      await firestore()
        .collection('users')
        .doc(user.uid)
        .set({ isSubscribed: true }, { merge: true });

      if (partnerData) {
        await firestore()
          .collection('users')
          .doc(partnerData.id)
          .set({ isSubscribed: true }, { merge: true });
      }

      const customerUserDocRef = firestore().collection('customers').doc(user.uid);
      const customerUserDoc = await customerUserDocRef.get();

      if (customerUserDoc.exists) {
        trackEvent('customer_user_found');
        return true;
      }

      return false;
    } catch (error: any) {
      if (error.userCancelled) {
        trackEvent('user_cancelled_purchasing_product');
        return false;
      }

      crashlytics().log('Error purchasing product');
      trackEvent('error_purchasing_product', { error });

      return rejectWithValue(error.message);
    }
  },
);

export const restorePurchases = createAsyncThunk(
  'app/restorePurchases',
  async (_, { rejectWithValue }) => {
    try {
      await Purchases.restorePurchases();

      return null;
    } catch (error: any) {
      console.log('Error restoring purchases', error);

      if (error.userCancelled) {
        trackEvent('user_cancelled_restoring_purchases');
        return null;
      }

      crashlytics().log('Error restoring purchases');
      trackEvent('error_restoring_purchases', { error });

      return rejectWithValue(error.message);
    }
  },
);
