import React, { useRef, useEffect } from 'react';
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
  const dispatch = useDispatch();
  const notification = useSelector(selectNotification);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const dismissNotification = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
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

      timer = setTimeout(dismissNotification, 20000);
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
          <Title>{title}</Title>
          {description && <Description>{description}</Description>}
        </Content>
        {buttonText && (
          <ButtonWrapper>
            <Button onPress={onButtonPress}>
              <ButtonText type={type}>{buttonText}</ButtonText>
            </Button>
          </ButtonWrapper>
        )}
        <CloseButton onPress={dismissNotification}>
          <CloseIcon width={14} height={14} />
        </CloseButton>
      </Container>
    </AnimatedContainer>
  );
}

export default Notification;
