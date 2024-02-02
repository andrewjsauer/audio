import { BlurView } from '@react-native-community/blur';
import styled from 'styled-components/native';

export const QuestionContainer = styled.View`
  margin-top: 60px;
  flex: 1;
`;

export const BlurredBackground = styled(BlurView)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100%;
`;
