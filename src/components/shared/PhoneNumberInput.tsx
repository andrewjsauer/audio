import React from 'react';
import { StyleSheet } from 'react-native';
import PhoneNumberInput from 'react-native-phone-number-input';

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
    fontSize: 18,
    fontFamily: 'Nunito-Regular',
  },
  textInput: {
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

function PhoneNumberInputContainer({
  phoneInputRef,
  phoneNumber,
  setPhoneNumber,
}: Props) {
  return (
    <PhoneNumberInput
      autoFocus
      codeTextStyle={styles.codeText}
      containerStyle={styles.phoneInput}
      defaultCode="US"
      layout="first"
      onChangeFormattedText={setPhoneNumber}
      ref={phoneInputRef}
      textContainerStyle={styles.textContainer}
      textInputStyle={styles.textInput}
      value={phoneNumber}
    />
  );
}

export default PhoneNumberInputContainer;
