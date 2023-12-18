import React from 'react';
import { Modal } from 'react-native';
import styled from 'styled-components/native';

const Overlay = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const PopupContainer = styled.View`
  width: 90%;
  background-color: white;
  padding: 20px;
  border-radius: 20px;
  align-items: center;
  elevation: 5;
`;

const PopupTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
`;

const PopupButton = styled.TouchableOpacity`
  background-color: #f00;
  padding: 10px 20px;
  border-radius: 10px;
  margin-top: 10px;
`;

const PopupButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

function MyPopup({ visible, onRequestClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onRequestClose}
      onDismiss={onRequestClose}>
      <Overlay>
        <PopupContainer>
          <PopupTitle>
            Whats the best date you two have been on together?
          </PopupTitle>
          <PopupButton onPress={() => {}}>
            <PopupButtonText>Allow</PopupButtonText>
          </PopupButton>
        </PopupContainer>
      </Overlay>
    </Modal>
  );
}

export default MyPopup;
