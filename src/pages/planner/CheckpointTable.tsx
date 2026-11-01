import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from '@mui/material';
import { Checkpoint } from '@app/types/trip';
import { RISK_LABELS, riskColor } from './risk';

interface CheckpointTableProps {
  checkpoints: Checkpoint[];
  onFocus: (checkpoint: Checkpoint) => void;
}

const CheckpointTable = ({ checkpoints, onFocus }: CheckpointTableProps) => {
  const { t } = useTranslation();

  return (
    <TableContainer sx={{ maxHeight: 320 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>{t('planner.checkpoints.mile', 'Mile')}</TableCell>
            <TableCell>{t('planner.checkpoints.eta', 'ETA')}</TableCell>
            <TableCell align="right">{t('planner.checkpoints.wind', 'Wind')}</TableCell>
            <TableCell align="right">{t('planner.checkpoints.rain', 'Rain')}</TableCell>
            <TableCell align="right">{t('planner.checkpoints.snow', 'Snow')}</TableCell>
            <TableCell>{t('planner.checkpoints.risk', 'Risk')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {checkpoints.map(cp => {
            const level = cp.risk?.level;
            return (
              <TableRow key={cp.mile} hover onClick={() => onFocus(cp)} sx={{ cursor: 'pointer' }}>
                <TableCell>{Math.round(cp.mile)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{dayjs(cp.eta).format('ddd HH:mm')}</TableCell>
                <TableCell align="right">{cp.weather ? Math.round(cp.weather.wind_mph) : '—'}</TableCell>
                <TableCell align="right">{cp.weather ? cp.weather.rain_in_hr.toFixed(2) : '—'}</TableCell>
                <TableCell align="right">{cp.weather ? cp.weather.snow_in_hr.toFixed(2) : '—'}</TableCell>
                <TableCell>
                  <Tooltip
                    title={cp.risk?.load_adjusted ? t('planner.checkpoints.loadAdjusted', 'Raised by the load-weight wind rule') : ''}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-block',
                        px: 0.75,
                        borderRadius: 1,
                        color: '#fff',
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                        bgcolor: riskColor(level),
                      }}
                    >
                      {level ? t(`planner.risk.${level}`, RISK_LABELS[level]) : t('planner.risk.unknown', 'No forecast')}
                      {cp.risk?.load_adjusted ? ' ⚖' : ''}
                    </Box>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CheckpointTable;
