import styled from 'styled-components/native';

export const LayoutContainer = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.white};
`;

export const BackButtonWrapper = styled.TouchableOpacity`
  margin-bottom: 20px;
`;

export const Header = styled.View<{ isAddedPadding: boolean; isAndroidMarginTop: boolean }>`
  margin-top: ${(p) => (p.isAndroidMarginTop ? '10px' : '40px')};
  padding: ${(p) => (p.isAddedPadding ? '0 20px' : '0 10px')};
`;

export const KeyboardAvoidingView = styled.KeyboardAvoidingView`
  flex: 1;
`;

export const View = styled.View`
  flex: 1;
`;
