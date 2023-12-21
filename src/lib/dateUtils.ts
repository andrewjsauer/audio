import { format, isToday } from 'date-fns';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export const formatDate = (timestamp?: FirebaseFirestoreTypes.Timestamp) => {
  if (!timestamp) return '';
  let date = timestamp as FirebaseFirestoreTypes.Timestamp;

  try {
    if (typeof timestamp?.toDate === 'function') {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp.seconds * 1000);
    }

    return isToday(date) ? 'Today' : format(date, 'PPP');
  } catch (error) {
    return '';
  }
};

export const formatTime = (timestamp?: FirebaseFirestoreTypes.Timestamp) => {
  if (!timestamp) return '';
  let date = timestamp;

  try {
    if (typeof timestamp?.toDate === 'function') {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp.seconds * 1000);
    }

    return format(date, 'p');
  } catch (error) {
    return '';
  }
};
