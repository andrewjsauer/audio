import { createAsyncThunk } from '@reduxjs/toolkit';

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import analytics from '@react-native-firebase/analytics';
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
  async (fetchedUserData?: UserDataType, { getState, rejectWithValue, dispatch }) => {
    const state = getState();
    const partnershipData = selectPartnershipData(state);
    const storedUserData = selectUserData(state);
    const partnerData = selectPartnerData(state);

    let partnership = partnershipData;
    const userData = fetchedUserData || storedUserData;

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
        trackEvent('Initializing Subscriber Fetch Latest Question Success');
      } else if (fetchLatestQuestion.rejected.match(resultAction)) {
        trackEvent('Initializing Subscriber Fetch Latest Question Failed', {
          error: resultAction.payload,
        });
      }

      return null;
    } catch (error) {
      trackEvent('Initializing Subscriber Failed', { error });
      return rejectWithValue(error);
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
      trackEvent('Signing Out Failed', { error });
      return rejectWithValue(error);
    }
  },
);

export const initializeSession = createAsyncThunk(
  'app/initializeSession',
  async (user: FirebaseAuthTypes.User, { rejectWithValue }) => {
    try {
      initializeAnalytics(null);

      if (__DEV__) Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

      const apiKey =
        Platform.OS === 'ios'
          ? (Config.revenueCatiOSKey as string)
          : (Config.revenueCatAndroidKey as string);

      Purchases.configure({
        apiKey,
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
      trackEvent('Initializing Session Failed', { error });
      return rejectWithValue(error);
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
          trackEvent('Error Purchasing Promo', { error });
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
        trackEvent('User Cancelled Purchasing Product');
        return null;
      }

      trackEvent('Purchasing Product Failed', { error });
      return rejectWithValue(error);
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
        trackEvent('User Cancelled Restoring Purchases');
        return null;
      }

      trackEvent('Restoring Purchases Failed', { error });
      return rejectWithValue(error);
    }
  },
);
