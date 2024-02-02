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

  const [newName, setNewName] = useState(name);
  const [updateAttempted, setUpdateAttempted] = useState(false);

  useEffect(() => {
    if (updateAttempted && name === newName) {
      dispatch(
        showNotification({
          title: 'accountScreen.nameScreen.success',
          type: 'success',
        }),
      );

      trackEvent('Name Changed');
      setUpdateAttempted(false);
    }
  }, [name, newName, dispatch, updateAttempted]);

  const handleSubmit = () => {
    if (newName.trim() && name !== newName) {
      dispatch(updateUser({ id, userDetails: { name: newName.trim() } }));
      setUpdateAttempted(true);
      trackEvent('New Name Save Button Tapped');
    } else {
      dispatch(
        showNotification({
          title: 'errors.userNameEmpty',
          type: 'error',
        }),
      );
    }
  };

  const handleNameChange = (typedName: string) => {
    setNewName(typedName);
  };

  return (
    <Layout titleKey="accountScreen.nameScreen.title" screen="Name Screen">
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
