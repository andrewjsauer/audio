import styled from 'styled-components/native';

export const Title = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.medium};
  color: ${(p) => p.theme.colors.black};
  text-align: center;
  margin-bottom: 12px;
`;

export const Timer = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.regular};
  color: ${(p) => p.theme.colors.lightGray};
  text-align: center;
`;

export const PlayBackContainer = styled.View`
  align-items: center;
  justify-content: space-around;
  flex: 1;
  flex-direction: row;
`;

export const PlayBackButton = styled.TouchableOpacity<{ type: string }>`
  background-color: ${(p) => p.theme.colors.play};
  border: 6px solid rgba(255, 255, 255, 0.5);
  width: 80px;
  height: 80px;
  border-radius: 50px;
  align-items: center;
  justify-content: center;
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};
`;

export const ReactionButton = styled.TouchableOpacity<{
  isSelected: boolean;
  isFaded: boolean;
}>`
  border-radius: 30px;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  opacity: ${(p) => (p.isFaded ? 0.5 : 1)};
  background-color: ${(p) => (p.isSelected ? p.theme.colors.play : p.theme.colors.transparentGray)};
`;

export const ReactionIcon = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.xlarge};
`;
