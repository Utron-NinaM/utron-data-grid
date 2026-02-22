import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useTranslations } from '../localization/useTranslations';

/**
 * @param {{ errors: Array<{ field: string, message?: string }> }} props
 */
export function ValidationAlert({ errors }) {
  const t = useTranslations();
  if (!errors?.length) return null;
  return (
    <Alert severity="error" sx={{ mt: 1 , marginBottom: 1}}>
      <AlertTitle>{t('validationErrors')}</AlertTitle>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {errors.map((e, i) => (
          <li key={`${e.field}-${i}`}>{e.message ? `${e.field}: ${e.message}` : e.field}</li>
        ))}
      </ul>
    </Alert>
  );
}
