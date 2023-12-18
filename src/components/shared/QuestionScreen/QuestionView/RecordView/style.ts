import styled from 'styled-components/native';

export const Container = styled.View`
  flex-direction: row;
  justify-content: center;
`;

export const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50px;
`;

export const IconButton = styled.TouchableOpacity.attrs((props) => ({
  activeOpacity: props.disabled ? 1 : 0.2,
}))<{ color: string; disabled?: boolean }>`
  align-items: center;
  justify-content: center;
  width: 78px;
  height: 78px;
  border-radius: 50px;
  background-color: ${(p) => p.color};
  margin: 5px;
  border: 6px solid rgba(255, 255, 255, 0.5);
  opacity: ${(p) => (p.disabled ? 0.3 : 1)};
`;

export const Content = styled.View`
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  margin-left: 14px;
`;

export const Title = styled.Text<{ isFaded: boolean }>`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.regular};
  color: ${(p) =>
    p.isFaded ? p.theme.colors.lightGray : p.theme.colors.black};
  text-align: center;
`;

export const Description = styled.Text`
  font-family: ${(p) => p.theme.fonts.regular};
  font-size: ${(p) => p.theme.fontSizes.small};
  color: ${(p) => p.theme.colors.lightGray};
  text-align: center;
`;
