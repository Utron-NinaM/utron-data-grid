import React, { useContext } from 'react';
import { DataGridStableContext } from '../DataGrid/DataGridContext';
import { Box, IconButton } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export function PaginationIcons({ onFirstPage, onPrevPage, onNextPage, onLastPage, firstDisabled, prevDisabled, nextDisabled, lastDisabled }) {
    const ctx = useContext(DataGridStableContext);
    const direction = ctx?.direction ?? 'ltr';    
    return (
      <Box sx={{ display: direction === 'rtl' ? 'flex-row-reverse' : 'flex-row' }}>
        <IconButton onClick={onFirstPage} disabled={firstDisabled} size="small" aria-label="First page">
          {direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton onClick={onPrevPage} disabled={prevDisabled} size="small" aria-label="Previous page">
          {direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
        <IconButton onClick={onNextPage} disabled={nextDisabled} size="small" aria-label="Next page">
          {direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
        <IconButton onClick={onLastPage} disabled={lastDisabled} size="small" aria-label="Last page">
          {direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </Box>
    );
  }