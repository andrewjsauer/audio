import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import RNLanguageDetector from '@os-team/i18next-react-native-language-detector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crashlytics from '@react-native-firebase/crashlytics';

import en from './en.json'; // English
import es from './es.json'; // Spanish
import zhCN from './zh-CN.json'; // Simplified Chinese
import hi from './hi.json'; // Hindi
import ar from './ar.json'; // Arabic
import bn from './bn.json'; // Bengali
import pt from './pt.json'; // Portuguese
import ru from './ru.json'; // Russian
import fr from './fr.json'; // French
import de from './de.json'; // German
// import ja from './ja.json';       // Japanese
// import ko from './ko.json';       // Korean
// import it from './it.json';       // Italian

const resources = {
  en: { translation: en },
  es: { translation: es },
  'zh-CN': { translation: zhCN },
  hi: { translation: hi },
  ar: { translation: ar },
  bn: { translation: bn },
  pt: { translation: pt },
  ru: { translation: ru },
  fr: { translation: fr },
  de: { translation: de },
  // ja: { translation: ja },
  // ko: { translation: ko },
  // it: { translation: it },
};

export const changeLanguage = async (language: string) => {
  try {
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem('userLanguage', language);
  } catch (error) {
    crashlytics().recordError(error);
  }
};

const loadLanguagePreference = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem('userLanguage');
    return storedLanguage || 'en';
  } catch (error) {
    crashlytics().recordError(error);
    return 'en';
  }
};

i18n
  .use(RNLanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
    supportedLngs: [
      'en',
      'es',
      'zh-CN',
      'hi',
      'ar',
      'bn',
      'pt',
      'ru',
      'fr',
      'de',
      'ja',
      'ko',
      'it',
    ],
  });

loadLanguagePreference().then((storedLanguage) => {
  i18n
    .use(RNLanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: storedLanguage,
      fallbackLng: 'en',
      compatibilityJSON: 'v3',
      interpolation: {
        escapeValue: false,
      },
      supportedLngs: [
        'en',
        'es',
        'zh-CN',
        'hi',
        'ar',
        'bn',
        'pt',
        'ru',
        'fr',
        'de',
        'ja',
        'ko',
        'it',
      ],
    });
});
