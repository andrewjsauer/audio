import React from 'react';
import { useTranslation } from 'react-i18next';

import PlayIcon from '@assets/icons/play.svg';
import QuestionIcon from '@assets/icons/help.svg';
import LockIcon from '@assets/icons/lock.svg';
import MicIcon from '@assets/icons/mic.svg';

import { RecordStatusType as StatusTypes } from './types';
import { Container } from './style';

type RecordViewProps = {
  name: string;
  color: string;
  status: StatusTypes;
  createdAt: Date;
  isPartner?: boolean;
};

const statusOptions = (t: any, isPartner, name) => ({
  [StatusTypes.Lock]: {
    icon: LockIcon,
    title: t('questionScreen.subscriberScreen.lock.title', {
      name: isPartner ? name : t('you'),
    }),
    description: t('questionScreen.subscriberScreen.lock.description'),
  },
  [StatusTypes.PendingRecord]: {
    icon: QuestionIcon,
    title: t('questionScreen.subscriberScreen.lock.title', {
      name,
    }),
  },
  [StatusTypes.Play]: 'Recorded',
  [StatusTypes.Record]: 'Recorded',
});

function RecordView({
  color,
  createdAt,
  isPartner = false,
  name,
  status,
}: RecordViewProps) {
  const { t } = useTranslation();

  const options = statusOptions(t, isPartner, name)[status];
  return <Container />;
}

export default RecordView;
