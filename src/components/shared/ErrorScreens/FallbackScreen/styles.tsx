import styled from 'styled-components/native';

export const Layout = styled.SafeAreaView`
  flex: 1;
  background-color: #ffffff;
`;

export const Container = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Message = styled.Text`
  font-family: Nunito-Bold;
  font-size: 20px;
  color: #000000;
  padding: 0 48px;
  text-align: center;
  margin-bottom: 24px;
`;
