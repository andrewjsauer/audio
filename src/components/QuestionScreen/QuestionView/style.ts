import styled from 'styled-components/native';

export const Container = styled.View`
  flex-direction: column;
  justify-content: center;
  padding: 0 20px;
  margin-bottom: 30px;
`;

export const TimerText = styled.Text`
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.xsmall};
  color: ${(p) => p.theme.colors.lightGray};
`;

export const QuestionText = styled.Text`
  margin-top: 12px;
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.question};
  color: ${(p) => p.theme.colors.black};
`;

export const QuestionRowContainers = styled.View`
  margin-top: 20px;
`;
