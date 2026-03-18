import React from 'react';
import { Box } from '@mui/material';
import csvSvg from '../../assets/csv.svg';
import pdfSvg from '../../assets/pdf.svg';
import { GRID_BUTTONS_COLOR } from '../../constants';

export function ExportIcon({ type = 'csv', sx, ...props }) {
  const iconSvg = type === 'pdf' ? pdfSvg : csvSvg;
  const alt = type === 'pdf' ? 'PDF' : 'CSV';

  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        maskImage: `url(${iconSvg})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        backgroundColor: GRID_BUTTONS_COLOR,
        WebkitMaskImage: `url(${iconSvg})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        ...sx,
      }}
      aria-label={alt}
      {...props}
    />
  );
}
