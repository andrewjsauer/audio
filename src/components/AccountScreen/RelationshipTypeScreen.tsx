import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AppDispatch } from '@store/index';
import { updatePartnership } from '@store/partnership/thunks';
import { selectPartnershipData, selectIsLoading } from '@store/partnership/selectors';

import { trackEvent } from '@lib/analytics';

import Layout from '@components/shared/Layout';
import LoadingView from '@components/shared/LoadingView';
import RelationshipTypePicker from '@components/shared/RelationshipTypePicker';

import { RelationshipTypeContainer } from './style';

function RelationshipTypeScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const { type, id } = useSelector(selectPartnershipData);
  const isLoading = useSelector(selectIsLoading);

  const handleChange = (selectedType: string) => {
    if (type !== selectedType) {
      trackEvent('Relationship Status Changed', { type: selectedType });
      dispatch(updatePartnership({ id, partnershipDetails: { type: selectedType } }));
    }
  };

  return (
    <Layout
      titleKey="accountScreen.relationshipTypeScreen.title"
      screen="Relationship Status Screen"
    >
      {isLoading ? (
        <LoadingView />
      ) : (
        <RelationshipTypeContainer>
          <RelationshipTypePicker onChange={handleChange} value={type} />
        </RelationshipTypeContainer>
      )}
    </Layout>
  );
}

export default RelationshipTypeScreen;
