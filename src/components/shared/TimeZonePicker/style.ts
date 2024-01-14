import styled from 'styled-components/native';

export const TimeZoneList = styled.ScrollView`
  width: 100%;
  height: 100%;
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
