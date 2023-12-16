import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: space-around;
  align-items: center;
  background-color: #fff;
`;

export const Title = styled.Text`
  font-size: 24px;
  margin: 10px;
`;

export const PriceInfo = styled.Text`
  font-size: 18px;
  margin: 5px;
`;

export const Button = styled.TouchableOpacity`
  background-color: #000;
  padding: 15px 30px;
  border-radius: 30px;
  margin: 10px;
`;

export const ButtonText = styled.Text`
  color: #fff;
  font-size: 18px;
`;

export const RestoreButton = styled(Button)`
  background-color: transparent;
  border: 1px solid #000;
`;
