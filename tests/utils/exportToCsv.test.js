import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCsv } from '../../src/utils/exportToCsv';

describe('exportToCsv', () => {
  let mockAnchor;
  let createObjectURLSpy;
  let revokeObjectURLSpy;
  let blobConstructor;
  let capturedBlobs;

  beforeEach(() => {
    // Mock anchor element
    mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    };

    // Mock document.createElement
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockAnchor;
      }
      return document.createElement(tagName);
    });

    // Mock URL.createObjectURL and URL.revokeObjectURL
    createObjectURLSpy = vi.fn(() => 'blob:mock-url');
    revokeObjectURLSpy = vi.fn();
    global.URL.createObjectURL = createObjectURLSpy;
    global.URL.revokeObjectURL = revokeObjectURLSpy;

    // Capture Blob instances
    capturedBlobs = [];
    blobConstructor = global.Blob;
    global.Blob = vi.fn((parts, options) => {
      const blob = new blobConstructor(parts, options);
      capturedBlobs.push({ parts, options, blob });
      return blob;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.Blob = blobConstructor;
  });

  describe('basic export', () => {
    it('exports simple data to CSV', () => {
      const columns = [{ field: 'name' }, { field: 'age' }];
      const rows = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];

      exportToCsv({ columns, rows });

      expect(global.Blob).toHaveBeenCalled();
      const blobCall = capturedBlobs[0];
      expect(blobCall.options.type).toBe('text/csv;charset=utf-8');
      
      const csvContent = blobCall.parts[0];
      expect(csvContent).toContain('name,age');
      expect(csvContent).toContain('Alice,30');
      expect(csvContent).toContain('Bob,25');
    });

    it('uses default filename when not provided', () => {
      const columns = [{ field: 'id' }];
      const rows = [{ id: 1 }];

      exportToCsv({ columns, rows });

      expect(mockAnchor.download).toBe('export.csv');
    });

    it('uses custom filename when provided', () => {
      const columns = [{ field: 'id' }];
      const rows = [{ id: 1 }];

      exportToCsv({ columns, rows, filename: 'custom-export.csv' });

      expect(mockAnchor.download).toBe('custom-export.csv');
    });
  });

  describe('header generation', () => {
    it('uses headerName when available', () => {
      const columns = [
        { field: 'name', headerName: 'Full Name' },
        { field: 'age', headerName: 'Age' },
      ];
      const rows = [{ name: 'Alice', age: 30 }];

      exportToCsv({ columns, rows });

      const csvContent = capturedBlobs[0].parts[0];
      expect(csvContent).toContain('Full Name,Age');
      expect(csvContent).not.toContain('name,age');
    });

    it('falls back to field when headerName is missing', () => {
      const columns = [
        { field: 'name', headerName: 'Full Name' },
        { field: 'age' },
      ];
      const rows = [{ name: 'Alice', age: 30 }];

      exportToCsv({ columns, rows });

      const csvContent = capturedBlobs[0].parts[0];
      expect(csvContent).toContain('Full Name,age');
    });

    it('handles empty columns array', () => {
      const columns = [];
      const rows = [{ name: 'Alice' }];

      exportToCsv({ columns, rows });

      const csvContent = capturedBlobs[0].parts[0];
      // Empty header row + one empty data row = BOM + '\r\n'
      expect(csvContent).toBe('\uFEFF\r\n');
    });

    it('handles empty rows array', () => {
      const columns = [{ field: 'name' }, { field: 'age' }];
      const rows = [];

      exportToCsv({ columns, rows });

      const csvContent = capturedBlobs[0].parts[0];
      expect(csvContent).toBe('\uFEFFname,age');
    });
  });

  describe('CSV escaping', () => {
    it('escapes values containing commas', () => {
      const columns = [{ field: 'name' }, { field: 'address' }];
      const rows = [{ name: 'Alice', address: '123 Main St, Apt 4' }];

      exportToCsv({ columns, rows });

      const csvContent = capturedBlobs[0].parts[0];
      expect(csvContent).toContain('"123 Main St, Apt 4"');
    });

    it('escapes values containing quotes', () => {
      const columns = [{ field: 'quote' }];
      const rows = [{ quote: 'He said "Hello"' }];

      exportToCsv({ columns, rows });

      const csvContent = capturedBlobs[0].parts[0];
      expect(csvContent).toContain('"He said ""Hello"""');
    });

    it('escapes values containing newlines', () => {
      const columns = [{ field: 'text' }];
      const rows = [{ text: 'Line 1\nLine 2' }];

      exportToCsv({ columns, rows });

      const csvContent = capturedBlobs[0].parts[0];
      expect(csvContent).toContain('"Line 1\nLine 2"');
    });

    it('escapes values containing carriage returns', () => {
      const columns = [{ field: 'text' }];
      const rows = [{ text: 'Line 1\rLine 2' }];

      exportToCsv({ columns, rows });

      const csvContent = capturedBlobs[0].parts[0];
      expect(csvContent).toContain('"Line 1\rLine 2"');
    });

    it('handles null values as empty strings', () => {
      const columns = [{ field: 'name' }, { field: 'value' }];
      const rows = [{ name: 'Alice', value: null }];

      exportToCsv({ columns, rows });

      const csvContent = capturedBlobs[0].parts[0];
      expect(csvContent).toContain('Alice,');
    });

    it('handles undefined values as empty strings', () => {
      const columns = [{ field: 'name' }, { field: 'value' }];
      const rows = [{ name: 'Alice', value: undefined }];

      exportToCsv({ columns, rows });

      const csvContent = capturedBlobs[0].parts[0];
      expect(csvContent).toContain('Alice,');
    });

    it('converts non-string values to strings', () => {
      const columns = [{ field: 'id' }, { field: 'active' }, { field: 'score' }];
      const rows = [
        { id: 123, active: true, score: 98.5 },
      ];

      exportToCsv({ columns, rows });

      const csvContent = capturedBlobs[0].parts[0];
      expect(csvContent).toContain('123,true,98.5');
    });
  });

  describe('BOM and line endings', () => {
    it('includes UTF-8 BOM for Excel compatibility', () => {
      const columns = [{ field: 'name' }];
      const rows = [{ name: 'Alice' }];

      exportToCsv({ columns, rows });

      const csvContent = capturedBlobs[0].parts[0];
      expect(csvContent.charCodeAt(0)).toBe(0xfeff); // UTF-8 BOM
    });

    it('uses CRLF line endings', () => {
      const columns = [{ field: 'name' }];
      const rows = [
        { name: 'Alice' },
        { name: 'Bob' },
      ];

      exportToCsv({ columns, rows });

      const csvContent = capturedBlobs[0].parts[0];
      const lines = csvContent.split('\r\n');
      expect(lines.length).toBeGreaterThan(1);
      expect(csvContent).toContain('\r\n');
    });
  });

  describe('download trigger', () => {
    it('creates object URL from blob', () => {
      const columns = [{ field: 'id' }];
      const rows = [{ id: 1 }];

      exportToCsv({ columns, rows });

      expect(createObjectURLSpy).toHaveBeenCalledWith(capturedBlobs[0].blob);
    });

    it('sets anchor href to object URL', () => {
      const columns = [{ field: 'id' }];
      const rows = [{ id: 1 }];

      exportToCsv({ columns, rows });

      expect(mockAnchor.href).toBe('blob:mock-url');
    });

    it('triggers download by clicking anchor', () => {
      const columns = [{ field: 'id' }];
      const rows = [{ id: 1 }];

      exportToCsv({ columns, rows });

      expect(mockAnchor.click).toHaveBeenCalled();
    });

    it('revokes object URL after download', () => {
      const columns = [{ field: 'id' }];
      const rows = [{ id: 1 }];

      exportToCsv({ columns, rows });

      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('edge cases', () => {
    it('handles missing columns parameter', () => {
      const rows = [{ name: 'Alice' }];

      exportToCsv({ rows });

      const csvContent = capturedBlobs[0].parts[0];
      // Empty header row + one empty data row = BOM + '\r\n'
      expect(csvContent).toBe('\uFEFF\r\n');
    });

    it('handles missing rows parameter', () => {
      const columns = [{ field: 'name' }];

      exportToCsv({ columns });

      const csvContent = capturedBlobs[0].parts[0];
      expect(csvContent).toBe('\uFEFFname');
    });

    it('handles rows with missing field values', () => {
      const columns = [{ field: 'name' }, { field: 'age' }, { field: 'city' }];
      const rows = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', city: 'NYC' },
      ];

      exportToCsv({ columns, rows });

      const csvContent = capturedBlobs[0].parts[0];
      expect(csvContent).toContain('Alice,30,');
      expect(csvContent).toContain('Bob,,NYC');
    });

    it('handles special characters in headers', () => {
      const columns = [
        { field: 'name', headerName: 'Name, "Title"' },
        { field: 'age' },
      ];
      const rows = [{ name: 'Alice', age: 30 }];

      exportToCsv({ columns, rows });

      const csvContent = capturedBlobs[0].parts[0];
      expect(csvContent).toContain('"Name, ""Title"""');
    });
  });
});
