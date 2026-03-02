import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTranslations } from '../localization/useTranslations';

export function EditToolbar({ onSave, onCancel, saveButtonSx, cancelButtonSx }) {
  const t = useTranslations();
  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
      <Button size="small" variant="contained" onClick={onSave} {...(saveButtonSx && { sx: saveButtonSx })}>{t('save')}</Button>
      <Button size="small" onClick={onCancel} {...(cancelButtonSx && { sx: cancelButtonSx })}>{t('cancel')}</Button>
    </Box>
  );
}
