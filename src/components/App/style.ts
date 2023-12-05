import styled from 'styled-components/native';

export const StyledSafeAreaView = styled.SafeAreaView`
  background-color: ${({ theme }) =>
    theme.isDarkMode ? '#1C1C1E' : '#F3F3F3'};
`;
