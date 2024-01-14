import React from 'react';
import { FlatList } from 'react-native';
import moment from 'moment-timezone';

import { TimeZoneItem, TimeZoneLabel, TimeZoneCode, Checkmark } from './style';

function TimeZonePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (option: string) => void;
}) {
  const timeZones = moment.tz.names();

  const getAbbreviation = (zone: string) => {
    const zoneSplit = zone.split('/');
    return zoneSplit.length > 1 ? zoneSplit[1].substring(0, 3) : zone.substring(0, 3);
  };

  const abbreviateZoneName = (zone: string) => {
    return zone.length > 25 ? `${zone.substring(0, 22)}...` : zone;
  };

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
    <FlatList
      data={timeZones}
      renderItem={renderItem}
      keyExtractor={(item) => item}
      extraData={value}
    />
  );
}

export default TimeZonePicker;
