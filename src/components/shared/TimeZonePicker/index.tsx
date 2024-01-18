import React, { useState, useMemo } from 'react';
import { FlatList } from 'react-native';
import moment from 'moment-timezone';

import {
  TimeZoneItem,
  Container,
  SearchInput,
  TimeZoneLabel,
  TimeZoneCode,
  Checkmark,
} from './style';

function TimeZonePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (option: string) => void;
}) {
  const [searchText, setSearchText] = useState('');
  const timeZones = moment.tz.names();

  const getAbbreviation = (zone: string) => {
    const zoneSplit = zone.split('/');
    return zoneSplit.length > 1 ? zoneSplit[1].substring(0, 3) : zone.substring(0, 3);
  };

  const abbreviateZoneName = (zone: string) => {
    return zone.length > 25 ? `${zone.substring(0, 22)}...` : zone;
  };

  const normalizeText = (text) => text.toLowerCase().replace(/[_\- ]+/g, '');

  const filteredAndSortedTimeZones = useMemo(() => {
    const filtered = timeZones.filter((zone) =>
      normalizeText(zone).includes(normalizeText(searchText)),
    );

    if (value) {
      filtered.sort((a, b) => (a === value ? -1 : b === value ? 1 : 0));
    }

    return filtered;
  }, [timeZones, searchText, value]);

  const renderItem = ({ item: zone }) => {
    const isSelected = value === zone;
    const abbreviation = getAbbreviation(zone);
    const abbreviatedZoneName = abbreviateZoneName(zone);

    return (
      <TimeZoneItem selected={isSelected} onPress={() => onChange(zone)}>
        <TimeZoneLabel>
          {abbreviatedZoneName} (UTC{moment.tz(zone).format('Z')})
        </TimeZoneLabel>
        {isSelected ? <Checkmark>✓</Checkmark> : <TimeZoneCode>{abbreviation}</TimeZoneCode>}
      </TimeZoneItem>
    );
  };

  return (
    <Container>
      <SearchInput
        placeholder="Search Time Zones"
        onChangeText={setSearchText}
        value={searchText}
      />
      <FlatList
        data={filteredAndSortedTimeZones}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        extraData={value}
      />
    </Container>
  );
}

export default TimeZonePicker;
