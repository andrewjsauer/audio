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

export const signOut = createAsyncThunk(
  'app/signOut',
  async (userId: string, { dispatch, rejectWithValue }) => {
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

    try {
      await Purchases.logOut();
      await auth().signOut();

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

      const customerUserDocRef = firestore()
        .collection('customers')
        .doc(user.uid);

      if (!customerUserDocRef.empty) {
        trackEvent('customer_user_found');
        return { isPreviouslySubscribed: true };
      }

      trackEvent('customer_user_not_found');
      return { isPreviouslySubscribed: false };
    } catch (error) {
      crashlytics().log('Error initializing session');
      trackEvent('error_initializing_session', { error });

      return rejectWithValue(error.message);
    }
  },
);

export const purchaseProduct = createAsyncThunk(
  'app/purchaseProduct',
  async (user: FirebaseAuthTypes.User, { rejectWithValue }) => {
    try {
      await Purchases.purchaseProduct('yf_1799_1m_1m0');
      await user.getIdToken(true);

      return null;
    } catch (error: any) {
      if (error.userCancelled) {
        trackEvent('user_cancelled_purchasing_product');
        return null;
      }

      crashlytics().log('Error purchasing product');
      trackEvent('error_purchasing_product', { error });

      return rejectWithValue(error.message);
    }
  },
);

export const restorePurchases = createAsyncThunk(
  'app/restorePurchases',
  async (user: FirebaseAuthTypes.User, { rejectWithValue }) => {
    try {
      await Purchases.restorePurchases();
      await user.getIdToken(true);

      return null;
    } catch (error: any) {
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
