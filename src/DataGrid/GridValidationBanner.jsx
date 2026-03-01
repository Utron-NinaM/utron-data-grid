import React, { useMemo } from 'react';
import { useSyncExternalStore } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Chip from '@mui/material/Chip';
import ErrorIcon from '@mui/icons-material/Error';
import { useTranslations } from '../localization/useTranslations';
import { getGridValidationBannerSx, getAlertListItemSx } from './dataGridStyles';

/**
 * Sliding validation banner above the grid. No reserved space when hidden.
 * Errors grouped by rowId; each item clickable to scroll to row/cell.
 * @param {{ columns: Object[], editStore: Object, onErrorClick?: (rowId: string|number, field: string) => void }}
 */
export function GridValidationBanner({ columns, editStore, onErrorClick }) {
  const t = useTranslations();
  const rowErrors = useSyncExternalStore(
    editStore?.subscribe ?? (() => () => {}),
    () => editStore?.getSnapshot?.()?.validationState?.rowErrors ?? {},
    () => ({})
  );

  const { hasErrors, totalCount, items } = useMemo(() => {
    const rowIds = Object.keys(rowErrors);
    let count = 0;
    const list = [];
    for (const rowId of rowIds) {
      const byField = rowErrors[rowId] || {};
      for (const [field, errs] of Object.entries(byField)) {
        const arr = Array.isArray(errs) ? errs : [];
        count += arr.length;
        const headerName = columns?.find((c) => c.field === field)?.headerName ?? field;
        for (const e of arr) {
          list.push({ rowId, field, headerName, message: e.message ?? '' });
        }
      }
    }
    return { hasErrors: count > 0, totalCount: count, items: list };
  }, [rowErrors, columns]);

  return (
    <Box
      aria-hidden={!hasErrors}
        sx={getGridValidationBannerSx({ hasErrors })}
    >
      <Alert
        severity="error"
        icon={<ErrorIcon />}
        sx={{
          borderRadius: 0,
          '& .MuiAlert-message': { width: '100%' },
        }}
      >
        <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {t('validationErrorsFound', { count: totalCount })}
          <Chip size="small" label={t('validationFieldErrorsCount', { count: totalCount })} color="error" variant="outlined" />
        </AlertTitle>
        <Box component="ul" sx={{ margin: 0, paddingLeft: 2.5, listStyle: 'none' }} role="list">
          {items.map((item, i) => (
            <Box
              component="li"
              key={`${item.rowId}-${item.field}-${i}`}
              role={onErrorClick ? 'button' : undefined}
              tabIndex={onErrorClick ? 0 : undefined}
              sx={{
                ...getAlertListItemSx({ onErrorClick }),
              }}
              onClick={() => onErrorClick?.(item.rowId, item.field)}
              onKeyDown={(e) => {
                if (onErrorClick && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onErrorClick(item.rowId, item.field);
                }
              }}
            >
              {item.headerName}: {item.message}
            </Box>
          ))}
        </Box>
      </Alert>
    </Box>
  );
}
