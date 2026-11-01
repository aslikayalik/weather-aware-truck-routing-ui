import * as React from 'react';
import dayjs from 'dayjs';

export interface IDurationFormat {
  value: any;
  blankOnInvalid?: boolean;
  locale?: string;
}

export const DurationFormat = ({ value, blankOnInvalid, locale }: IDurationFormat) => {
  if (blankOnInvalid && !value) {
    return null;
  }

  if (!locale) {
    locale = "en";
  }

  return (
    <span title={value}>
      {dayjs
        .duration(value)
        .locale(locale || 'tr')
        .humanize()}
    </span>
  );
};
