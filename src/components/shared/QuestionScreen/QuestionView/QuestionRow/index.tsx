import React from 'react';
import { useTranslation } from 'react-i18next';
import { format, isToday, isValid } from 'date-fns';

import { ReactionTypeIcons, QuestionStatusType as StatusTypes, ReactionType } from '@lib/types';

import PlayIcon from '@assets/icons/play.svg';
import QuestionIcon from '@assets/icons/help.svg';
import LockIcon from '@assets/icons/lock.svg';
import MicIcon from '@assets/icons/mic.svg';

import {
  Container,
  Content,
  IconButton,
  Title,
  Description,
  ReactionOrb,
  ReactionIcon,
} from './style';

type QuestionRowProps = {
  color: string;
  createdAt: Date | number | null;
  isPartner?: boolean;
  name: string;
  onPress: () => void;
  reaction?: ReactionType | null;
  status: StatusTypes;
  partnerColor: string;
};

function getStatusOptions(status, createdAt, name, isPartner, t) {
  const validDate = createdAt && isValid(new Date(createdAt));
  const formattedDate = validDate ? format(new Date(createdAt), 'PP') : '';
  const formattedTime = validDate ? format(new Date(createdAt), 'p') : '';

  return {
    [StatusTypes.Lock]: {
      icon: LockIcon,
      title: t('questionScreen.subscriberScreen.lock.title', { name }),
      description: t('questionScreen.subscriberScreen.lock.description'),
    },
    [StatusTypes.PendingRecord]: {
      icon: QuestionIcon,
      title: t('questionScreen.subscriberScreen.pendingRecord.title', { name }),
      description: '',
    },
    [StatusTypes.Play]: {
      icon: PlayIcon,
      title: t('questionScreen.subscriberScreen.play.title', { name: isPartner ? name : t('you') }),
      description: t('questionScreen.subscriberScreen.play.description', {
        date: validDate && isToday(new Date(createdAt)) ? t('today') : formattedDate,
        time: formattedTime,
      }),
    },
    [StatusTypes.Record]: {
      icon: MicIcon,
      title: t('questionScreen.subscriberScreen.record.title'),
      description: '',
    },
  }[status];
}

function QuestionRow({
  color,
  createdAt,
  isPartner = false,
  name,
  onPress,
  reaction,
  status,
  partnerColor,
}: QuestionRowProps) {
  const { t } = useTranslation();

  const {
    icon: Icon,
    title,
    description,
  } = getStatusOptions(status, createdAt, name, isPartner, t);
  return (
    <Container>
      <IconButton
        color={color}
        disabled={status === StatusTypes.PendingRecord || status === StatusTypes.Lock}
        onPress={onPress}
      >
        <Icon width={30} height={30} />
        {reaction && (
          <ReactionOrb color={partnerColor}>
            <ReactionIcon>{ReactionTypeIcons[reaction]}</ReactionIcon>
          </ReactionOrb>
        )}
      </IconButton>
      <Content>
        <Title isFaded={status === StatusTypes.PendingRecord}>{title}</Title>
        {description && <Description>{description}</Description>}
      </Content>
    </Container>
  );
}

export default QuestionRow;
