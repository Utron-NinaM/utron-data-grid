import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToPdf } from '../../src/utils/exportToPdf';
import { jsPDF } from 'jspdf';

// Mock jsPDF
vi.mock('jspdf', () => {
  const mockDoc = {
    addFileToVFS: vi.fn(),
    addFont: vi.fn(),
    setFont: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
    autoTable: vi.fn(),
    lastAutoTable: { finalY: 100 },
  };
  return {
    jsPDF: vi.fn(() => mockDoc),
  };
});

// Mock jspdf-autotable
vi.mock('jspdf-autotable', () => ({}));

describe('exportToPdf', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Reset jsPDF mock
    vi.mocked(jsPDF).mockClear();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('error handling', () => {
    it('logs error and re-throws when PDF document creation fails', async () => {
      vi.mocked(jsPDF).mockImplementation(() => {
        throw new Error('PDF creation failed');
      });

      const columns = [{ field: 'id' }];
      const rows = [{ id: 1 }];

      await expect(
        exportToPdf({ columns, rows, filename: 'test.pdf' })
      ).rejects.toThrow('Failed to create PDF document');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'PDF document creation failed:',
        expect.any(Error)
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'PDF export failed:',
        expect.any(Error)
      );
    });

    it('logs error and re-throws when font registration fails', async () => {
      const mockDoc = {
        addFileToVFS: vi.fn(() => {
          throw new Error('Font registration failed');
        }),
        addFont: vi.fn(),
        setFont: vi.fn(),
        text: vi.fn(),
        save: vi.fn(),
        autoTable: vi.fn(),
        lastAutoTable: { finalY: 100 },
      };
      vi.mocked(jsPDF).mockReturnValue(mockDoc);

      const columns = [{ field: 'id' }];
      const rows = [{ id: 1 }];

      await expect(
        exportToPdf({
          columns,
          rows,
          filename: 'test.pdf',
          fontBase64: 'test-font-base64',
        })
      ).rejects.toThrow('Failed to register fonts for PDF export');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'PDF font registration failed:',
        expect.any(Error)
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'PDF export failed:',
        expect.any(Error)
      );
    });

    it('logs error and re-throws when autoTable generation fails', async () => {
      const mockDoc = {
        addFileToVFS: vi.fn(),
        addFont: vi.fn(),
        setFont: vi.fn(),
        text: vi.fn(),
        save: vi.fn(),
        autoTable: vi.fn(() => {
          throw new Error('Table generation failed');
        }),
        lastAutoTable: { finalY: 100 },
      };
      vi.mocked(jsPDF).mockReturnValue(mockDoc);

      const columns = [{ field: 'id' }];
      const rows = [{ id: 1 }];

      await expect(
        exportToPdf({ columns, rows, filename: 'test.pdf' })
      ).rejects.toThrow('Failed to generate PDF table');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'PDF table generation failed at chunk:',
        expect.any(Error)
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'PDF export failed:',
        expect.any(Error)
      );
    });

    it('logs error and re-throws when PDF save fails', async () => {
      const mockDoc = {
        addFileToVFS: vi.fn(),
        addFont: vi.fn(),
        setFont: vi.fn(),
        text: vi.fn(),
        save: vi.fn(() => {
          throw new Error('Save failed');
        }),
        autoTable: vi.fn(),
        lastAutoTable: { finalY: 100 },
      };
      vi.mocked(jsPDF).mockReturnValue(mockDoc);

      const columns = [{ field: 'id' }];
      const rows = [{ id: 1 }];

      await expect(
        exportToPdf({ columns, rows, filename: 'test.pdf' })
      ).rejects.toThrow('Failed to save PDF file');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'PDF save failed:',
        expect.any(Error)
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'PDF export failed:',
        expect.any(Error)
      );
    });

    it('handles errors in empty data export', async () => {
      vi.mocked(jsPDF).mockImplementation(() => {
        throw new Error('Empty PDF creation failed');
      });

      const columns = [];
      const rows = [];

      await expect(
        exportToPdf({ columns, rows, filename: 'test.pdf' })
      ).rejects.toThrow('Empty PDF creation failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'PDF export failed (empty data):',
        expect.any(Error)
      );
    });

    it('handles progress callback errors gracefully', async () => {
      const mockDoc = {
        addFileToVFS: vi.fn(),
        addFont: vi.fn(),
        setFont: vi.fn(),
        text: vi.fn(),
        save: vi.fn(),
        autoTable: vi.fn(),
        lastAutoTable: { finalY: 100 },
      };
      vi.mocked(jsPDF).mockReturnValue(mockDoc);

      const columns = [{ field: 'id' }];
      const rows = [{ id: 1 }];
      const onProgress = vi.fn(() => {
        throw new Error('Progress callback failed');
      });

      // Should not throw, but log the error
      await exportToPdf({
        columns,
        rows,
        filename: 'test.pdf',
        onProgress,
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Progress callback error:',
        expect.any(Error)
      );
      // Should still complete successfully
      expect(mockDoc.save).toHaveBeenCalled();
    });

    it('handles errors during chunk processing', async () => {
      let callCount = 0;
      const mockDoc = {
        addFileToVFS: vi.fn(),
        addFont: vi.fn(),
        setFont: vi.fn(),
        text: vi.fn(),
        save: vi.fn(),
        autoTable: vi.fn((options) => {
          callCount++;
          // Fail on second call (second chunk)
          if (callCount === 2) {
            throw new Error('Chunk processing failed');
          }
        }),
        lastAutoTable: { finalY: 100 },
      };
      vi.mocked(jsPDF).mockReturnValue(mockDoc);

      const columns = [{ field: 'id' }];
      // Create enough rows to trigger multiple chunks (CHUNK_SIZE is 1000)
      const rows = Array.from({ length: 1500 }, (_, i) => ({ id: i + 1 }));

      await expect(
        exportToPdf({ columns, rows, filename: 'test.pdf' })
      ).rejects.toThrow('Failed to generate PDF table');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'PDF table generation failed at chunk:',
        expect.any(Error)
      );
    });
  });
});
