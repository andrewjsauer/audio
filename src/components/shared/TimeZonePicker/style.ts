import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
`;

export const TimeZoneItem = styled.TouchableOpacity<{ selected: boolean }>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 14px 10px;
  border-bottom-width: 1px;
  border-bottom-color: #ccc;
  background-color: ${(props) => (props.selected ? '#e9ecef' : 'white')};
`;

export const TimeZoneLabel = styled.Text`
  font-size: ${(p) => p.theme.fontSizes.small};
`;

export const TimeZoneCode = styled.Text`
  font-weight: bold;
  margin-right: 10px;
  text-transform: uppercase;
`;

export const Checkmark = styled.Text`
  color: ${(p) => p.theme.colors.blue};
  font-weight: bold;
  margin-right: 10px;
`;

export const SearchInput = styled.TextInput`
  width: 100%;
  height: 40px;
  padding: 0 10px;
  border-bottom-width: 1px;
  border-bottom-color: #ccc;
  margin-bottom: 10px;
`;
