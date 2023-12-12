import * as React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@components/shared/Button';
import { Layout, Message, Container } from './styles';

interface Props {
  resetState: () => void;
}

function FallbackScreen({ resetState }: Props) {
  const { t } = useTranslation();

  return (
    <Layout>
      <Container>
        <Message>{t('errors.whoops')}</Message>
        <Button
          mode="dark"
          size="small"
          onPress={resetState}
          text={t('errors.tryAgain')}
        />
      </Container>
    </Layout>
  );
}

export default FallbackScreen;
