import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import i18n from 'i18next';

import { changeLanguage } from '@locales/index';
import { trackEvent } from '@lib/analytics';

import Layout from '@components/shared/Layout';

export const languageMap: { [key: string]: string } = {
  en: 'English',
  es: 'Spanish',
  zhCN: 'Simplified Chinese',
  hi: 'Hindi',
  ar: 'Arabic',
  bn: 'Bengali',
  pt: 'Portuguese',
  ru: 'Russian',
  fr: 'French',
  de: 'German',
  ja: 'Japanese',
  ko: 'Korean',
  it: 'Italian',
};

function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    changeLanguage(languageCode);

    trackEvent('language_change', { language: languageCode });
  };

  return (
    <Layout titleKey="accountScreen.languageScreen.title" screen="language_account_screen">
      <Picker
        selectedValue={selectedLanguage}
        onValueChange={(itemValue) => handleLanguageChange(itemValue)}
        mode="dropdown"
      >
        {Object.entries(languageMap).map(([code, name]) => (
          <Picker.Item key={code} label={name} value={code} />
        ))}
      </Picker>
    </Layout>
  );
}

export default LanguageScreen;
