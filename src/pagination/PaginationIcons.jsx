import React, { useContext } from 'react';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { Box, IconButton } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { DIRECTION_RTL, DIRECTION_LTR } from '../config/schema';

export function PaginationIcons({ onFirstPage, onPrevPage, onNextPage, onLastPage, firstDisabled, prevDisabled, nextDisabled, lastDisabled }) {
    const ctx = useContext(DataGridStableContext);
    const direction = ctx?.direction ?? DIRECTION_LTR;    
    return (
      <Box sx={{ display: direction === DIRECTION_RTL ? 'flex-row-reverse' : 'flex-row' }}>
        <IconButton onClick={onFirstPage} disabled={firstDisabled} size="small" aria-label="First page">
          {direction === DIRECTION_RTL ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton onClick={onPrevPage} disabled={prevDisabled} size="small" aria-label="Previous page">
          {direction === DIRECTION_RTL ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
        <IconButton onClick={onNextPage} disabled={nextDisabled} size="small" aria-label="Next page">
          {direction === DIRECTION_RTL ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
        <IconButton onClick={onLastPage} disabled={lastDisabled} size="small" aria-label="Last page">
          {direction === DIRECTION_RTL ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </Box>
    );
  }