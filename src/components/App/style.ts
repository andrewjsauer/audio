import styled from 'styled-components/native';

export const SectionContainer = styled.View`
  margin-top: 32px;
  padding-horizontal: 24px;
`;

export const SectionTitle = styled.Text`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => (theme.isDarkMode ? '#FFFFFF' : '#000000')};
`;

export const SectionDescription = styled.Text`
  margin-top: 8px;
  font-size: 18px;
  font-weight: 400;
  color: ${({ theme }) => (theme.isDarkMode ? '#D0D0C0' : '#333333')};
`;

export const Highlight = styled.Text`
  font-weight: 700;
`;

export const StyledSafeAreaView = styled.SafeAreaView`
  background-color: ${({ theme }) =>
    theme.isDarkMode ? '#1C1C1E' : '#F3F3F3'};
`;

export const StyledScrollView = styled.ScrollView`
  background-color: ${({ theme }) =>
    theme.isDarkMode ? '#1C1C1E' : '#F3F3F3'};
`;

export const ContentContainer = styled.View`
  background-color: ${({ theme }) =>
    theme.isDarkMode ? '#000000' : '#FFFFFF'};
`;
