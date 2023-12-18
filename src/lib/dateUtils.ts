import { format, isToday } from 'date-fns';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export const formatDate = (timestamp?: FirebaseFirestoreTypes.Timestamp) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    console.log('Invalid timestamp provided to formatDate:', timestamp);
    return '';
  }

  try {
    const date = timestamp.toDate();
    return isToday(date) ? 'Today' : format(date, 'PPP');
  } catch (error) {
    console.log('Error converting timestamp to date:', error);
    return '';
  }
};

export const formatTime = (timestamp?: FirebaseFirestoreTypes.Timestamp) => {
  if (!timestamp || typeof timestamp.toDate !== 'function') {
    console.log('Invalid timestamp provided to formatDate:', timestamp);
    return '';
  }

  try {
    const date = timestamp.toDate();
    return format(date, 'p');
  } catch (error) {
    console.log('Error converting timestamp to date:', error);
    return '';
  }
};
