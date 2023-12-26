import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { format, isToday } from 'date-fns';

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
  createdAt: FirebaseFirestoreTypes.Timestamp | undefined;
  isPartner?: boolean;
  name: string;
  onPress: () => void;
  reaction?: ReactionType | null;
  status: StatusTypes;
  partnerColor: string;
};

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

  const statusOptions = useMemo(() => {
    return {
      [StatusTypes.Lock]: {
        icon: LockIcon,
        title: t('questionScreen.subscriberScreen.lock.title', {
          name,
        }),
        description: t('questionScreen.subscriberScreen.lock.description'),
      },
      [StatusTypes.PendingRecord]: {
        icon: QuestionIcon,
        title: t('questionScreen.subscriberScreen.pendingRecord.title', {
          name,
        }),
        description: '',
      },
      [StatusTypes.Play]: () => {
        const dateObject = createdAt.toDate();

        const formattedDate = isToday(dateObject) ? t('today') : format(dateObject, 'PP');
        const formattedTime = format(dateObject, 'p');
        return {
          icon: PlayIcon,
          title: t('questionScreen.subscriberScreen.play.title', {
            name: isPartner ? name : t('you'),
          }),
          description: t('questionScreen.subscriberScreen.play.description', {
            date: formattedDate,
            time: formattedTime,
          }),
        };
      },
      [StatusTypes.Record]: {
        icon: MicIcon,
        title: t('questionScreen.subscriberScreen.record.title'),
        description: '',
      },
    };
  }, [status]);

  const { icon: Icon, title, description } = statusOptions[status];
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
