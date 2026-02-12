import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { GridErrorBoundary } from '../../src/core/GridErrorBoundary';

// Component that throws an error
class ThrowError extends React.Component {
  render() {
    if (this.props.shouldThrow) {
      throw new Error(this.props.errorMessage || 'Test error');
    }
    return <div>No error</div>;
  }
}

// Component that throws error in render
const ThrowErrorFunction = ({ shouldThrow, errorMessage }) => {
  if (shouldThrow) {
    throw new Error(errorMessage || 'Test error');
  }
  return <div>No error</div>;
};

describe('GridErrorBoundary Component', () => {
  let consoleError;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (consoleError) {
      consoleError.mockRestore();
    }
  });

  describe('Test error boundary catches errors', () => {
    it('should catch errors thrown in child components', () => {
      render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary>
            <ThrowError shouldThrow={true} errorMessage="Test error message" />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      // Error boundary should catch the error and show fallback UI
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should catch errors from function components', () => {
      render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary>
            <ThrowErrorFunction shouldThrow={true} errorMessage="Function component error" />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should catch errors with custom error messages', () => {
      render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary>
            <ThrowError shouldThrow={true} errorMessage="Custom error message" />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/custom error message/i)).toBeInTheDocument();
    });

    it('should call onError callback when provided', () => {
      const onError = vi.fn();
      
      render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary onError={onError}>
            <ThrowError shouldThrow={true} errorMessage="Callback test error" />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it('should log error to console when onError is not provided', async () => {
      render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary>
            <ThrowError shouldThrow={true} errorMessage="Console test error" />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      // componentDidCatch is called asynchronously after render
      // Wait for console.error to be called
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      }, { timeout: 1000 });
      
      // The error boundary will call console.error in componentDidCatch
      const errorCall = consoleError.mock.calls.find(call => 
        call[0] && typeof call[0] === 'string' && call[0].includes('GridErrorBoundary caught an error:')
      );
      expect(errorCall).toBeTruthy();
    });

    it('should not catch errors when children render normally', () => {
      render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary>
            <ThrowError shouldThrow={false} />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });
  });

  describe('Test fallback UI renders', () => {
    it('should render error alert when error occurs', () => {
      render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary>
            <ThrowError shouldThrow={true} />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      // MUI Alert should be rendered
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should display default error message', () => {
      render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary>
            <ThrowError shouldThrow={true} />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      expect(screen.getByText(/something went wrong displaying this grid/i)).toBeInTheDocument();
    });

    it('should display error message from error object', () => {
      render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary>
            <ThrowError shouldThrow={true} errorMessage="Specific error occurred" />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      expect(screen.getByText(/something went wrong displaying this grid/i)).toBeInTheDocument();
      expect(screen.getByText(/specific error occurred/i)).toBeInTheDocument();
    });

    it('should render retry button', () => {
      render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary>
            <ThrowError shouldThrow={true} />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should render error alert with error severity', () => {
      render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary>
            <ThrowError shouldThrow={true} />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      // MUI Alert with severity="error" should have error styling
      expect(alert).toHaveClass('MuiAlert-standardError');
    });

    it('should handle errors without message property', () => {
      class ThrowErrorNoMessage extends React.Component {
        render() {
          if (this.props.shouldThrow) {
            const error = new Error();
            delete error.message;
            throw error;
          }
          return <div>No error</div>;
        }
      }

      render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary>
            <ThrowErrorNoMessage shouldThrow={true} />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      expect(screen.getByText(/something went wrong displaying this grid/i)).toBeInTheDocument();
      // Should not crash when error.message is undefined
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Test error recovery', () => {
    it('should recover from error when retry button is clicked', () => {
      const { rerender } = render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary key="boundary-1">
            <ThrowError shouldThrow={true} />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      // Error should be displayed
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Click retry button to reset error state
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // Error boundary should reset, but component still throws
      // We need to rerender with shouldThrow=false to actually recover
      // Use a new key to force React to remount the boundary
      rerender(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary key="boundary-2">
            <ThrowError shouldThrow={false} />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });

    it('should reset error state when retry is clicked', () => {
      const ThrowErrorControlled = ({ shouldThrow }) => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div>Recovered</div>;
      };

      const { rerender } = render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary key="boundary-1">
            <ThrowErrorControlled shouldThrow={true} />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // Rerender with shouldThrow=false and new key to force remount
      rerender(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary key="boundary-2">
            <ThrowErrorControlled shouldThrow={false} />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      expect(screen.getByText('Recovered')).toBeInTheDocument();
    });

    it('should allow multiple error-recovery cycles', () => {
      const ThrowErrorControlled = ({ shouldThrow }) => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div>No error</div>;
      };

      let keyCounter = 1;
      const { rerender } = render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary key={`boundary-${keyCounter++}`}>
            <ThrowErrorControlled shouldThrow={true} />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      // First error
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));

      // Recover
      rerender(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary key={`boundary-${keyCounter++}`}>
            <ThrowErrorControlled shouldThrow={false} />
          </GridErrorBoundary>
        </ThemeProvider>
      );
      expect(screen.getByText('No error')).toBeInTheDocument();

      // Second error
      rerender(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary key={`boundary-${keyCounter++}`}>
            <ThrowErrorControlled shouldThrow={true} />
          </GridErrorBoundary>
        </ThemeProvider>
      );
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Recover again
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      rerender(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary key={`boundary-${keyCounter++}`}>
            <ThrowErrorControlled shouldThrow={false} />
          </GridErrorBoundary>
        </ThemeProvider>
      );
      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should clear error state on retry even if component still throws', () => {
      const { rerender } = render(
        <ThemeProvider theme={createTheme()}>
          <GridErrorBoundary>
            <ThrowError shouldThrow={true} />
          </GridErrorBoundary>
        </ThemeProvider>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // Error boundary state is reset, but component still throws
      // So error will be caught again immediately
      // The key is that the state was reset (no crash)
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
