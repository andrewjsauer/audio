import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Container,
  Content,
  Title,
  Description,
  ButtonWrapper,
  Button,
  ButtonText,
} from './style';

function PermissionNotification({
  onPermissionPress,
}: {
  onPermissionPress: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Container>
      <Content>
        <Title>
          {t('questionScreen.subscriberScreen.audioPermissions.title')}
        </Title>
        <Description>
          {t('questionScreen.subscriberScreen.audioPermissions.description')}
        </Description>
      </Content>
      <ButtonWrapper>
        <Button onPress={onPermissionPress}>
          <ButtonText>
            {t('questionScreen.subscriberScreen.audioPermissions.buttonText')}
          </ButtonText>
        </Button>
      </ButtonWrapper>
    </Container>
  );
}

export default PermissionNotification;
