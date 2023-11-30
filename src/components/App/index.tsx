import React, { useState, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Header } from 'react-native/Libraries/NewAppScreen';
import { useTranslation, Trans } from 'react-i18next';
import DropDownPicker from 'react-native-dropdown-picker';

import {
  SectionContainer,
  SectionTitle,
  SectionDescription,
  Highlight,
  StyledSafeAreaView,
  StyledScrollView,
  ContentContainer,
} from './style';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({ children, title }: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <SectionContainer>
      <SectionTitle theme={{ isDarkMode }}>{title}</SectionTitle>
      <SectionDescription theme={{ isDarkMode }}>{children}</SectionDescription>
    </SectionContainer>
  );
}

function App(): JSX.Element {
  const { t, i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [items, setItems] = useState([
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
  ]);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const isDarkMode = useColorScheme() === 'dark';

  return (
    <StyledSafeAreaView theme={{ isDarkMode }}>
      <DropDownPicker
        open={open}
        value={language}
        items={items}
        setOpen={setOpen}
        setValue={setLanguage}
        setItems={setItems}
      />
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#1C1C1E' : '#F3F3F3'}
      />
      <StyledScrollView
        contentInsetAdjustmentBehavior="automatic"
        theme={{ isDarkMode }}>
        <Header />
        <ContentContainer theme={{ isDarkMode }}>
          <Section title="Step One">
            <Trans i18nKey="home.example">
              Edit <Highlight>App.tsx</Highlight> to change this screen and then
              come back to see your edits.
            </Trans>
          </Section>
          <Section title="Learn More">{t('home.text')}</Section>
        </ContentContainer>
      </StyledScrollView>
    </StyledSafeAreaView>
  );
}

export default App;
