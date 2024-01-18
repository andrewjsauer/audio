import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { hideNotification } from '@store/ui/slice';
import { selectNotification } from '@store/ui/selectors';

import CloseIcon from '@assets/icons/close.svg';

import {
  CloseButton,
  Description,
  Container,
  Content,
  AnimatedContainer,
  Title,
  ButtonText,
  Button,
  ButtonWrapper,
} from './style';

function Notification() {
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const notification = useSelector(selectNotification);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const dismissNotification = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }).start(() => {
      dispatch(hideNotification());
    });
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (notification) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timeoutDuration = notification?.duration === 'long' ? 8000 : 4000;
      timer = setTimeout(dismissNotification, timeoutDuration);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [notification, fadeAnim, dispatch]);

  if (!notification) return null;

  const { title, description, buttonText, type, onButtonPress } = notification;
  return (
    <AnimatedContainer style={{ opacity: fadeAnim }}>
      <Container type={type}>
        <Content>
          <Title>{t(title)}</Title>
          {description && <Description>{t(description)}</Description>}
        </Content>
        {buttonText && (
          <ButtonWrapper>
            <Button onPress={onButtonPress}>
              <ButtonText type={type}>{t(buttonText)}</ButtonText>
            </Button>
          </ButtonWrapper>
        )}
        <CloseButton onPress={dismissNotification}>
          <CloseIcon width={16} height={16} />
        </CloseButton>
      </Container>
    </AnimatedContainer>
  );
}

export default Notification;
