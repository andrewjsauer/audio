import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@components/shared/Button';
import { ErrorContainer, ErrorText } from './style';

function ErrorView({ error, onRetry }: { error: string; onRetry?: () => void }) {
  const { t } = useTranslation();

  return (
    <ErrorContainer>
      <ErrorText>{t(error) || t('errors.whoops')}</ErrorText>
      {onRetry && <Button onPress={onRetry} text={t('retry')} size="small" mode="error" />}
    </ErrorContainer>
  );
}

export default ErrorView;
