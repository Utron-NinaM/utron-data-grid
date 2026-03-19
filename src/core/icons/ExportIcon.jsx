import React from 'react';
import { Box } from '@mui/material';
import csvSvg from '../../assets/csv.svg?raw';
import pdfSvg from '../../assets/pdf.svg?raw';
import { GRID_BUTTONS_COLOR } from '../../constants';

export function ExportIcon({ type = 'csv', sx, ...props }) {
  const iconSvg = type === 'pdf' ? pdfSvg : csvSvg;
  const alt = type === 'pdf' ? 'PDF' : 'CSV';

  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        maskImage: `url("data:image/svg+xml,${encodeURIComponent(iconSvg)}")`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        backgroundColor: GRID_BUTTONS_COLOR,
        WebkitMaskImage: `url("data:image/svg+xml,${encodeURIComponent(iconSvg)}")`,
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
