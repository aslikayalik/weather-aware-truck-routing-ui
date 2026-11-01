import React from 'react';
import { Box, Button, Typography, TextField, InputAdornment, Stack, Paper } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface FilterComponentProps {
  title: string;
  subtitle?: React.ReactNode;
  totalCount: number;
  addButtonLabel?: string;
  onAdd?: () => void;
  addButtonDisabled?: boolean;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  children?: React.ReactNode;
  stationTypeCounts?: { [type: string]: number };
  extraFilters?: React.ReactNode;
  searchMaxWidth?: number | string;
  hideDefaultFilterRow?: boolean;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  title,
  subtitle,
  totalCount,
  addButtonLabel,
  onAdd,
  addButtonDisabled = false,
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchValue = '',
  children,
  stationTypeCounts,
  extraFilters,
  searchMaxWidth,
  hideDefaultFilterRow = false,
}) => {
  const { t } = useTranslation();
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 0.5,
        p: 1.5,
        border: '1px solid #eaecf0',
        borderRadius: '12px',
        backgroundColor: '#fff',
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: subtitle ? 0.75 : 0.5 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            sx={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#101828',
              lineHeight: 1.2,
              mb: subtitle ? 0.25 : 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              sx={{
                fontSize: '12px',
                color: '#667085',
                lineHeight: 1.2,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>


        {onAdd && addButtonLabel && (
          <Button
            variant="contained"
            onClick={onAdd}
            disabled={addButtonDisabled}
            size="small"
            sx={{
              textTransform: 'none',
              fontSize: '13px',
              fontWeight: 600,
              px: 1.5,
              py: 0.75,
              borderRadius: '8px',
              backgroundColor: '#1570EF',
              boxShadow: 'none',
              minHeight: 32,
              opacity: addButtonDisabled ? 0.5 : 1,
              '&:hover': {
                backgroundColor: '#0e5fd8',
                boxShadow: 'none',
              },
              '&.Mui-disabled': {
                backgroundColor: '#1570EF',
                color: '#fff',
              },
            }}
          >
            + {addButtonLabel}
          </Button>
        )}
      </Stack>

      {children && (
        <Box sx={{ mb: hideDefaultFilterRow ? 0 : 1 }}>
          {children}
        </Box>
      )}

      {!hideDefaultFilterRow && (
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        alignItems={{ md: 'center' }}
      >
        <Stack
          direction="row"
          sx={{
            flexWrap: 'wrap',
            gap: 0.75,
          }}
        >
          <Button
            variant="text"
            disabled
            sx={{
              textTransform: 'none',
              fontSize: '13px',
              fontWeight: 700,
              color: '#1570EF',
              backgroundColor: '#eff8ff',
              borderRadius: '999px',
              px: 1.25,
              py: 0.25,
              minWidth: 'auto',
              minHeight: 28,
              lineHeight: 1.2,
              '&.Mui-disabled': {
                color: '#1570EF',
                backgroundColor: '#eff8ff',
              },
            }}
          >
            {t('common.all')} ({totalCount})
          </Button>

          {stationTypeCounts &&
            Object.entries(stationTypeCounts).map(([type, count]) => (
              <Button
                key={type}
                variant="text"
                disabled
                sx={{
                  textTransform: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#475467',
                  borderRadius: '999px',
                  px: 1.0,
                  py: 0.25,
                  minWidth: 'auto',
                  minHeight: 28,
                  lineHeight: 1.2,
                  '&.Mui-disabled': { color: '#475467' },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    maxWidth: 160,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {type}
                </Box>
                <Box
                  component="span"
                  sx={{
                    ml: 0.75,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f2f4f7',
                    color: '#475467',
                    fontWeight: 700,
                    fontSize: '12px',
                    borderRadius: '999px',
                    px: 0.75,
                    height: 20,
                    minWidth: 20,
                  }}
                >
                  {count}
                </Box>
              </Button>
            ))}
        </Stack>

        {extraFilters}

        <Box sx={{ flexGrow: 1, maxWidth: searchMaxWidth }}>
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: '#98a2b3' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '13px',
                '& fieldset': { borderColor: '#d0d5dd' },
              },
              '& .MuiOutlinedInput-input': {
                py: 0.75,
              },
            }}
          />
        </Box>
      </Stack>
      )}
    </Paper>
  );
};

export default FilterComponent;