import React, { useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Animated } from 'react-native';

import { ModalWrapper, ModalContainer, ModalDismiss } from './style';

function Modal({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  const translateY = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true },
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      if (event.nativeEvent.translationY > 250) {
        navigation.goBack();
      }
    }
  };

  return (
    <ModalWrapper>
      <ModalDismiss activeOpacity={1} onPress={() => navigation.goBack()} />
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          <ModalContainer>{children}</ModalContainer>
        </Animated.View>
      </PanGestureHandler>
    </ModalWrapper>
  );
}

export default Modal;
