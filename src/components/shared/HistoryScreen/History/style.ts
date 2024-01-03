import styled from 'styled-components/native';
import { BlurView } from '@react-native-community/blur';

export const Container = styled.View`
  flex: 1;
  margin-top: 20px;
  margin-bottom: 20px;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0 8px;
`;

export const BlurredBackground = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
`;

export const BlurredItemRow = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  z-index: 9999;
`;

export const NoResultsContainer = styled.View`
  border-radius: 20px;
  background: #f1f1f1;
  padding: 20px;
`;

export const NoResultsText = styled.Text`
  color: ${(p) => p.theme.colors.black};
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.regular};
  text-align: center;
`;

export const ItemContainer = styled.View`
  padding: 10px;
  flex-direction: row;
`;

export const ItemQuestionContainer = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: center;
  padding-right: 6px;
`;

export const ItemDate = styled.Text`
  color: ${(p) => p.theme.colors.black};
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.xsmall};
  margin-bottom: 4px;
`;

export const ItemQuestionText = styled.Text`
  color: ${(p) => p.theme.colors.black};
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.small};
`;

export const ItemQuestionStatusText = styled.Text`
  color: ${(p) => p.theme.colors.lightGray};
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.xsmall};
  margin-top: 4px;
`;

export const ItemIconContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const IconButton = styled.TouchableOpacity.attrs((props) => ({
  activeOpacity: props.disabled ? 1 : 0.2,
}))<{ color: string; disabled?: boolean }>`
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  border-radius: 50px;
  background-color: ${(p) => p.color};
  margin: 4px;
  border: 4px solid rgba(255, 255, 255, 0.5);
  opacity: ${(p) => (p.disabled ? 0.3 : 1)};
`;

export const ReactionOrb = styled.View<{ color: string }>`
  position: absolute;
  top: -16px;
  right: -10px;
  width: 25px;
  height: 25px;
  background-color: ${(props) => props.color};
  border-radius: 50px;
  border: 2px solid white;
  justify-content: center;
  align-items: center;
`;

export const ReactionIcon = styled.Text`
  font-size: 7px;
`;
