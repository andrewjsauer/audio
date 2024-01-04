import { createAsyncThunk } from '@reduxjs/toolkit';

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import Purchases from 'react-native-purchases';
import functions from '@react-native-firebase/functions';

import { Platform } from 'react-native';
import Config from 'react-native-config';

import { trackEvent } from '@lib/analytics';
import { UserDataType, PartnershipDataType } from '@lib/types';

import { updateUser } from '@store/auth/thunks';
import { fetchLatestQuestion } from '@store/question/thunks';
import { selectUserData } from '@store/auth/selectors';

export const initializeSubscriber = createAsyncThunk(
  'app/initializeSubscriber',
  async (_, { getState, rejectWithValue, dispatch }) => {
    trackEvent('initializing_subscriber');

    const state = getState();
    const userData = selectUserData(state);

    if (!userData) {
      return {
        partnershipData: {},
      };
    }

    try {
      const partnershipSnapshot = await firestore()
        .collection('partnership')
        .where('id', '==', userData.partnershipId)
        .get();

      const partnershipData = partnershipSnapshot.docs[0].data() as PartnershipDataType;
      const payload = {
        ...partnershipData,
        startDate: new Date(data.startDate._seconds * 1000),
        createdAt: new Date(data.createdAt._seconds * 1000),
      };

      dispatch(fetchLatestQuestion({ partnershipData: payload }));

      return {
        partnershipData: payload,
      };
    } catch (error) {
      crashlytics().log('Error initializing subscriber');
      trackEvent('error_initializing_subscriber', { error });

      return rejectWithValue(error.message);
    }
  },
);

export const signOut = createAsyncThunk(
  'app/signOut',
  async (
    {
      userId,
      isDelete = false,
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

      const { currentUser } = auth();

      if (currentUser) {
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

      return null;
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
      await Purchases.purchaseProduct('dq_999_1m_1m0');

      await functions().httpsCallable('updatePartnershipPurchase')({
        partnerId: partnerData.id,
        userId: user.uid,
      });

      return {
        hasSubscribed: true,
        isSubscribed: true,
      };
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
  async (_, { rejectWithValue }) => {
    try {
      await Purchases.restorePurchases();

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
