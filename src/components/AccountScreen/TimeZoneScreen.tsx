import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '@store/index';
import { updatePartnership } from '@store/partnership/thunks';
import { selectPartnershipData, selectIsLoading } from '@store/partnership/selectors';

import { trackEvent } from '@lib/analytics';

import Layout from '@components/shared/Layout';
import LoadingView from '@components/shared/LoadingView';
import TimeZonePicker from '@components/shared/TimeZonePicker';

import { TimeZoneContainer } from './style';

function TimeZoneScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const { timeZone, id } = useSelector(selectPartnershipData);
  const isLoading = useSelector(selectIsLoading);

  const handleTimeZoneChange = (selectedTimeZone: string) => {
    if (timeZone !== selectedTimeZone) {
      trackEvent('Relationship Time Zone Changed', { timeZone: selectedTimeZone });
      dispatch(updatePartnership({ id, partnershipDetails: { timeZone: selectedTimeZone } }));
    }
  };

  return (
    <Layout titleKey="accountScreen.timeZoneScreen.title" screen="Relationship Time Zone Screen">
      {isLoading ? (
        <LoadingView />
      ) : (
        <TimeZoneContainer>
          <TimeZonePicker onChange={handleTimeZoneChange} value={timeZone} />
        </TimeZoneContainer>
      )}
    </Layout>
  );
}

export default TimeZoneScreen;
