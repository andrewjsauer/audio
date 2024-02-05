import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';

import { trackEvent } from '@lib/analytics';

import { AppDispatch } from '@store/index';
import { updatePartnership } from '@store/partnership/thunks';
import { selectPartnershipData, selectIsLoading } from '@store/partnership/selectors';

import Layout from '@components/shared/Layout';
import LoadingView from '@components/shared/LoadingView';

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
  const dispatch = useDispatch<AppDispatch>();
  const { language, id } = useSelector(selectPartnershipData);

  const [selectedLanguage, setSelectedLanguage] = useState(language || 'en');
  const isLoading = useSelector(selectIsLoading);

  const handleLanguageChange = (languageCode: string) => {
    if (language !== languageCode) {
      dispatch(updatePartnership({ id, partnershipDetails: { language: languageCode } }));
      setSelectedLanguage(languageCode);

      trackEvent('Relationship Language Changed', { language: languageCode });
    }
  };

  return (
    <Layout titleKey="accountScreen.languageScreen.title" screen="Relationship Language Screen">
      {isLoading ? (
        <LoadingView />
      ) : (
        <Picker
          selectedValue={selectedLanguage}
          onValueChange={(itemValue) => handleLanguageChange(itemValue)}
          mode="dropdown"
        >
          {Object.entries(languageMap).map(([code, name]) => (
            <Picker.Item key={code} label={name} value={code} />
          ))}
        </Picker>
      )}
    </Layout>
  );
}

export default LanguageScreen;
