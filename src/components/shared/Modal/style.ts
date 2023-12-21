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
  max-width: 400px;
  min-width: 350px;
  margin: 0 8px;
  background-color: white;
  border-radius: 20px;
  margin-bottom: 12px;
  padding: 30px 10px 0 10px;
`;
