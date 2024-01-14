import { createAsyncThunk } from '@reduxjs/toolkit';

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import Purchases from 'react-native-purchases';
import functions from '@react-native-firebase/functions';

import { Platform } from 'react-native';
import Config from 'react-native-config';

import { trackEvent, initializeAnalytics, reset } from '@lib/analytics';
import { UserDataType } from '@lib/types';

import { fetchLatestQuestion } from '@store/question/thunks';
import { fetchPartnership, fetchPartnerData } from '@store/partnership/thunks';
import { updateUser } from '@store/auth/thunks';

import { selectUserData } from '@store/auth/selectors';
import { selectPartnershipData, selectPartnerData } from '@store/partnership/selectors';

export const initializeSubscriber = createAsyncThunk(
  'app/initializeSubscriber',
  async (_, { getState, rejectWithValue, dispatch }) => {
    const state = getState();
    const partnershipData = selectPartnershipData(state);
    const userData = selectUserData(state);
    const partnerData = selectPartnerData(state);

    let partnership = partnershipData;

    try {
      if (!partnershipData) {
        const partnershipResponse = await dispatch(fetchPartnership(userData.partnershipId));
        if (fetchPartnership.fulfilled.match(partnershipResponse)) {
          partnership = partnershipResponse.payload;
        }
      }

      if (!partnerData) {
        await dispatch(fetchPartnerData(userData.id));
      }

      const resultAction = await dispatch(fetchLatestQuestion({ partnershipData: partnership }));

      if (fetchLatestQuestion.fulfilled.match(resultAction)) {
        trackEvent('subscriber_question_fetched');
      } else if (fetchLatestQuestion.rejected.match(resultAction)) {
        trackEvent('subscriber_question_fetch_error', { error: resultAction.payload });
      }

      return null;
    } catch (error) {
      crashlytics().log('Error initializing subscriber');
      trackEvent('error_initializing_subscriber', { error: error.message });

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
        reset();
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
      initializeAnalytics(null);

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
      trackEvent('error_initializing_session', { error: error.message });

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
      productIdentifier,
    }: {
      user: FirebaseAuthTypes.User;
      partnerData?: UserDataType;
      productIdentifier: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const offerings = await Purchases.getOfferings();
      const availablePackages = offerings.current?.availablePackages;
      const targetPackage = availablePackages?.find(
        (p) => p.product.identifier === productIdentifier,
      );

      if (!targetPackage) {
        throw new Error('Package not found for product');
      }

      let purchaseResponse = null;

      if (targetPackage.product.discounts && targetPackage.product.discounts.length > 0) {
        try {
          const paymentDiscount = await Purchases.getPromotionalOffer(
            targetPackage.product,
            targetPackage.product.discounts[0],
          );

          if (paymentDiscount) {
            purchaseResponse = await Purchases.purchaseDiscountedPackage(
              targetPackage,
              paymentDiscount,
            );
          }
        } catch (error) {
          trackEvent('error_purchasing_promo', { error: error.message });
        }
      }

      if (!purchaseResponse) {
        purchaseResponse = await Purchases.purchasePackage(targetPackage);
      }

      if (purchaseResponse) {
        await functions().httpsCallable('updatePartnershipPurchase')({
          partnerId: partnerData?.id,
          userId: user.uid,
        });

        return {
          hasSubscribed: true,
          isSubscribed: true,
        };
      }

      return null;
    } catch (error: any) {
      if (error.userCancelled) {
        trackEvent('user_cancelled_purchasing_product');
        return null;
      }

      crashlytics().log('Error purchasing product');
      trackEvent('error_purchasing_product', { error: error.message });

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
      trackEvent('error_restoring_purchases', { error: error.message });

      return rejectWithValue(error.message);
    }
  },
);
