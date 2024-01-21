import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
`;

export const ErrorText = styled.Text`
  color: ${(p) => p.theme.colors.red};
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.medium};
  padding: 0 20px;
  text-align: center;
  margin-bottom: 20px;
`;

export const ErrorContainer = styled.View`
  align-items: center;
  flex: 1;
  justify-content: center;
`;

export const ReminderContainer = styled.View`
  align-items: center;
  justify-content: center;
  padding: 16px;
  margin: 0 20px;
  border-radius: 20px;
  background: ${(p) => p.theme.colors.transparentGray};
`;

export const ReminderTitle = styled.Text`
  color: ${(p) => p.theme.colors.darkGray};
  font-family: ${(p) => p.theme.fonts.black};
  font-size: ${(p) => p.theme.fontSizes.regular};
  text-align: center;
  margin-bottom: 6px;
`;

export const ReminderText = styled.Text`
  color: ${(p) => p.theme.colors.darkGray};
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.regular};
  text-align: center;
`;
