import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import PhoneNumberInput from 'react-native-phone-number-input';
import { AsYouType } from 'libphonenumber-js';

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 5,
  },
  phoneInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#909090',
  },
  textInput: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
  },
  inputStyle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#000000',
  },
  codeText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#000000',
  },
  textContainer: {
    backgroundColor: '#FFFFFF',
  },
});

type Props = {
  phoneInputRef: React.RefObject<PhoneNumberInput>;
  phoneNumber: string;
  setPhoneNumber: (text: string) => void;
};

function PhoneNumberInputContainer({ phoneInputRef, phoneNumber, setPhoneNumber }: Props) {
  const [countryCode, setCountryCode] = useState<any>('US');
  const { t } = useTranslation();

  const handlePhoneNumberChange = (number: string) => {
    const formattedNumber = new AsYouType(countryCode).input(number);
    setPhoneNumber(formattedNumber);
  };

  const handleCountryCodeChange = (code: string) => {
    setCountryCode(code);
  };

  return (
    <PhoneNumberInput
      autoFocus
      codeTextStyle={styles.codeText}
      containerStyle={styles.phoneInput}
      defaultCode={countryCode}
      layout="first"
      onChangeFormattedText={handlePhoneNumberChange}
      onChangeCountry={(country) => {
        handleCountryCodeChange(country?.cca2 || 'US');
      }}
      ref={phoneInputRef}
      textContainerStyle={styles.textContainer}
      textInputStyle={styles.textInput}
      value={phoneNumber}
      textInputProps={{
        placeholder: `${t('phoneNumber')}`,
        placeholderTextColor: '#909090',
        keyboardType: 'phone-pad',
      }}
    />
  );
}

export default PhoneNumberInputContainer;
