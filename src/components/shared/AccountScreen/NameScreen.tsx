import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { AppDispatch } from '@store/index';
import { updateUser } from '@store/auth/thunks';
import { selectUserData, selectIsLoading } from '@store/auth/selectors';
import { showNotification } from '@store/ui/slice';

import { trackEvent } from '@lib/analytics';
import Layout from '@components/shared/Layout';

import LoadingView from '@components/shared/LoadingView';
import Button from '@components/shared/Button';

import { KeyboardAvoidingView, TextInput, InputWrapper } from './style';

function NameScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const { name, id } = useSelector(selectUserData);
  const isLoading = useSelector(selectIsLoading);

  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (name === newName) {
      dispatch(
        showNotification({
          title: 'accountScreen.nameScreen.success',
          type: 'success',
        }),
      );
    }
  }, [name]);

  const handleSubmit = () => {
    trackEvent('name_change_submit_clicked');

    if (name && name !== newName) {
      dispatch(updateUser({ id, userDetails: { name: newName } }));
    }
  };

  const handleNameChange = (typedName: string) => {
    const nameWithoutWhitespace = typedName.replace(/\s+/g, '');
    setNewName(nameWithoutWhitespace);
  };

  return (
    <Layout titleKey="accountScreen.nameScreen.title" screen="name_account_screen">
      {isLoading ? (
        <LoadingView />
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <InputWrapper>
            <TextInput
              placeholder={t('accountScreen.nameScreen.placeholder')}
              keyboardType="default"
              onChangeText={handleNameChange}
              autoCapitalize="words"
              returnKeyType="next"
              value={newName}
              placeholderTextColor="#909090"
            />
          </InputWrapper>
          <Button
            text={t('accountScreen.nameScreen.submitButton')}
            onPress={handleSubmit}
            size="small"
          />
        </KeyboardAvoidingView>
      )}
    </Layout>
  );
}

export default NameScreen;