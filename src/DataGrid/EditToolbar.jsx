import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTranslations } from '../localization/useTranslations';

export function EditToolbar({ onSave, onCancel }) {
  const t = useTranslations();
  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
      <Button size="small" variant="contained" onClick={onSave}>{t('save')}</Button>
      <Button size="small" onClick={onCancel}>{t('cancel')}</Button>
    </Box>
  );
}
