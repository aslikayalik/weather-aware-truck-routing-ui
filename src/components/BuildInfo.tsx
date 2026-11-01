import React from 'react';
import buildInfo from '../buildInfo.json';

export const formatBuildVersion = (isoString: string) => {
  const date = new Date(isoString);
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `V-${year}.${month}.${day}.${hour}.${minute}`;
};

export const BuildInfo = () => (
  <div
    style={{
      position: 'fixed',
      bottom: '8px',
      right: '10px',
      fontSize: '11px',
      color: '#888',
      pointerEvents: 'none',
      zIndex: 1,
    }}
  >
    {formatBuildVersion(buildInfo.buildDate)}
  </div>
);
