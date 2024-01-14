import React from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment-timezone';

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
  partnerColor: string;
  reaction?: ReactionType | null;
  status: StatusTypes;
  timeZone: string;
};

function getStatusOptions({
  createdAt,
  isPartner,
  name,
  status,
  t,
  timeZone,
}: {
  createdAt: Date | number | null;
  isPartner: boolean;
  name: string;
  status: StatusTypes;
  t: any;
  timeZone: string;
}) {
  const date = moment(createdAt);
  const validDate = date.isValid();
  const formattedDate = validDate ? date.tz(timeZone).format('LL') : '';
  const formattedTime = validDate ? date.tz(timeZone).format('LT') : '';
  const isToday = validDate ? date.tz(timeZone).isSame(moment().tz(timeZone), 'day') : false;

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
        date: isToday ? t('today') : formattedDate,
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
  partnerColor,
  reaction,
  status,
  timeZone,
}: QuestionRowProps) {
  const { t } = useTranslation();

  const {
    icon: Icon,
    title,
    description,
  } = getStatusOptions({ status, createdAt, name, isPartner, t, timeZone });
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
