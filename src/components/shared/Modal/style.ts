import styled from 'styled-components/native';

export const ModalWrapper = styled.View`
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const ModalDismiss = styled.TouchableOpacity`
  flex: 1;
  width: 100%;
`;

export const ModalContainer = styled.View`
  height: 400px;
  background-color: white;
  border-radius: 20px;
  padding: 30px 14px 0 14px;
  margin-bottom: 12px;
`;
