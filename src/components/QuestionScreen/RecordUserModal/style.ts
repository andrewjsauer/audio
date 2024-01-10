import styled from 'styled-components/native';

export const Title = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.medium};
  color: ${(p) => p.theme.colors.black};
  text-align: center;
  margin-bottom: 12px;
  padding: 0 10px;
  min-width: 200px;
`;

export const SubTitle = styled.Text`
  font-family: ${(p) => p.theme.fonts.bold};
  font-size: ${(p) => p.theme.fontSizes.regular};
  color: ${(p) => p.theme.colors.lightGray};
  text-align: center;
`;

export const PermissionNotificationContainer = styled.View`
  align-items: center;
  justify-content: center;
  flex: 1;
`;

export const RecordContainer = styled.View`
  align-items: center;
  justify-content: center;
  flex: 1;
`;

export const RecordButton = styled.TouchableOpacity<{ type: string }>`
  background-color: ${(p) => p.theme.colors[p.type]};
  border: 6px solid rgba(255, 255, 255, 0.5);
  width: 80px;
  height: 80px;
  border-radius: 50px;
  align-items: center;
  justify-content: center;
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};
`;

export const PostRecordContainer = styled.View`
  align-items: center;
  justify-content: space-around;
  flex: 1;
  flex-direction: row;
`;

export const SecondaryButton = styled.TouchableOpacity<{ type: string }>`
  border-radius: 30px;
  background-color: ${(p) => p.theme.colors.white};
  align-items: center;
  justify-content: center;
  width: 110px;
  background-color: ${({ type, theme }) => {
    switch (type) {
      case 'redo':
        return theme.colors.transparentGray;
      case 'submit':
        return theme.colors.success;
      default:
        return theme.colors.white;
    }
  }};
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};
`;

export const SecondaryButtonText = styled.Text<{ type: string }>`
  padding: 12px 0;
  color: ${({ type, theme }) => {
    switch (type) {
      case 'redo':
        return theme.colors.lightGray;
      case 'submit':
        return theme.colors.white;
      default:
        return theme.colors.white;
    }
  }};
  font-family: ${(props) => props.theme.fonts.black};
  font-size: ${(props) => props.theme.fontSizes.regular};
  text-transform: uppercase;
`;
