import styled from 'styled-components/native';

export const LayoutContainer = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.white};
`;

export const BackButton = styled.TouchableOpacity<{ isDisabled: boolean }>`
  opacity: ${(p) => (p.isDisabled ? 0.4 : 1)};
  position: absolute;
  left: 20px;
  top: 16px;
  z-index: 999;
`;

export const Header = styled.View<{ isAndroidMarginTop: boolean }>`
  margin-top: ${(p) => (p.isAndroidMarginTop ? '10px' : '24px')};
  padding: 0 10px;
  flex-direction: row;
  align-items: center;
  width: 100%;
  position: relative;
`;

export const KeyboardAvoidingView = styled.KeyboardAvoidingView`
  flex: 1;
`;

export const View = styled.View`
  flex: 1;
`;

export const StatusContainer = styled.View`
  align-items: center;
  justify-content: center;
  flex-direction: row;
  width: 100%;
  margin: 4px 0;
`;

export const StatusItemContainer = styled.View<{ isLastItem: boolean }>`
  align-items: center;
  justify-content: center;
  flex-direction: column;

  ${(p) => !p.isLastItem && `margin-right: 14px;`}
`;

export const StatusCircle = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 40px;
  background-color: ${(p) => p.theme.colors.transparentGray};
  border: 2px solid ${(p) => p.theme.colors.lightGreen};
  align-items: center;
  justify-content: center;
`;

export const StatusText = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.xxsmall};
  font-family: ${(p) => p.theme.fonts.bold};
  color: ${(p) => p.theme.colors.darkGray};
  text-align: center;
`;

export const StatusDivider = styled.View`
  width: 50%;
  position: absolute;
  top: 20px;
  height: 3px;
  background-color: ${(p) => p.theme.colors.transparentGray};
`;
