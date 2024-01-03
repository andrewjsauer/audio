import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.white};
`;

export const SettingsButton = styled.TouchableOpacity`
  padding: 10px;
  align-self: flex-end;
  margin-right: 10px;
`;

export const HistoryButtonContainer = styled.View`
  align-items: center;
  margin-bottom: 30px;
`;
