import React from 'react';
import { useTranslation } from 'react-i18next';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { formatDate, formatTime } from '@lib/dateUtils';
import PlayIcon from '@assets/icons/play.svg';
import QuestionIcon from '@assets/icons/help.svg';
import LockIcon from '@assets/icons/lock.svg';
import MicIcon from '@assets/icons/mic.svg';
import { RecordStatusType as StatusTypes } from '../types';
import { Container, Content, IconButton, Title, Description } from './style';

type RecordViewProps = {
  color: string;
  createdAt: FirebaseFirestoreTypes.Timestamp | undefined;
  isDisabled?: boolean;
  isPartner?: boolean;
  name: string;
  status: StatusTypes;
};

type StatusOption = {
  icon: React.ElementType;
  title: string;
  description?: string;
};

const getStatusOptions = (
  t: any,
  name: string,
  isPartner: boolean,
  createdAt?: FirebaseFirestoreTypes.Timestamp,
): { [key in StatusTypes]: StatusOption } => {
  const date = createdAt ? formatDate(createdAt) : '';
  const time = createdAt ? formatTime(createdAt) : '';

  return {
    [StatusTypes.Lock]: {
      icon: LockIcon,
      title: t('questionScreen.subscriberScreen.lock.title', {
        name: isPartner ? name : t('you'),
      }),
      description: t('questionScreen.subscriberScreen.lock.description'),
    },
    [StatusTypes.PendingRecord]: {
      icon: QuestionIcon,
      title: t('questionScreen.subscriberScreen.pendingRecord.title', { name }),
    },
    [StatusTypes.Play]: {
      icon: PlayIcon,
      title: t('questionScreen.subscriberScreen.play.title', { name }),
      description: t('questionScreen.subscriberScreen.play.description', {
        date,
        time,
      }),
    },
    [StatusTypes.Record]: {
      icon: MicIcon,
      title: t('questionScreen.subscriberScreen.record.title'),
    },
  };
};

function RecordView({
  color,
  createdAt,
  isDisabled = false,
  isPartner = false,
  name,
  status,
}: RecordViewProps) {
  const { t } = useTranslation();

  const {
    icon: Icon,
    title,
    description,
  } = getStatusOptions(t, name, isPartner, createdAt)[status];

  return (
    <Container>
      <IconButton color={color} disabled={isDisabled}>
        <Icon width={30} height={30} />
      </IconButton>
      <Content>
        <Title isFaded={isDisabled}>{title}</Title>
        {description && <Description>{description}</Description>}
      </Content>
    </Container>
  );
}

export default RecordView;
