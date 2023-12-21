import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import { formatDate, formatTime } from '@lib/dateUtils';
import {
  ReactionTypeIcons,
  UserActionStatusType as StatusTypes,
  ReactionType,
} from '@lib/types';

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

type UserActionProps = {
  color: string;
  createdAt: FirebaseFirestoreTypes.Timestamp | undefined;
  isPartner?: boolean;
  name: string;
  onPress: () => void;
  reaction?: ReactionType | null;
  status: StatusTypes;
  partnerColor: string;
};

function UserAction({
  color,
  createdAt,
  isPartner = false,
  name,
  onPress,
  reaction,
  status,
  partnerColor,
}: UserActionProps) {
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
      [StatusTypes.Play]: {
        icon: PlayIcon,
        title: t('questionScreen.subscriberScreen.play.title', {
          name: isPartner ? name : t('you'),
        }),
        description: t('questionScreen.subscriberScreen.play.description', {
          date: formatDate(createdAt),
          time: formatTime(createdAt),
        }),
      },
      [StatusTypes.Record]: {
        icon: MicIcon,
        title: t('questionScreen.subscriberScreen.record.title'),
        description: '',
      },
    };
  }, [createdAt, name, isPartner, status]);

  const { icon: Icon, title, description } = statusOptions[status];
  return (
    <Container>
      <IconButton
        color={color}
        disabled={
          status === StatusTypes.PendingRecord || status === StatusTypes.Lock
        }
        onPress={onPress}>
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

export default UserAction;
