import styled from 'styled-components/native';

export const Layout = styled.SafeAreaView`
  height: 100%;
`;

export const Container = styled.View`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: relative;
`;

export const Message = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: #000;
  margin-bottom: 24px;
  padding: 0 48px;
  text-align: center;
`;

export const Button = styled.Button`
  background-color: #6699cc;
  padding: 8px 12px;
  color: #fff;
`;
