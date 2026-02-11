import React from 'react';
import { Alert, Box, Button } from '@mui/material';

/**
 * Catches rendering errors in the grid body so surrounding controls remain usable.
 */
export class GridErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const { onError } = this.props;
    if (typeof onError === 'function') {
      onError(error, errorInfo);
      return;
    }
    // Default reporting path for consumers that do not provide onError.
    // eslint-disable-next-line no-console
    console.error('GridErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (!hasError) return children;

    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={this.handleRetry}>
              Retry
            </Button>
          }
        >
          Something went wrong displaying this grid.
          {error?.message ? ` ${error.message}` : ''}
        </Alert>
      </Box>
    );
  }
}
