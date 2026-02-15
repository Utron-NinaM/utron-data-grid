import React, { useState } from 'react';
import { DataGrid } from '../src/DataGrid/DataGrid';
import { conditionalEditingColumns } from './conditionalEditingColumns';
import { conditionalEditingData } from './conditionalEditingData';
import { en } from './translations';
import { DIRECTION_RTL } from '../src/config/schema';

export function ConditionalEditingExample() {
  const [data, setData] = useState(conditionalEditingData);
  const [validationMessage, setValidationMessage] = useState('');

  const handleEditCommit = (rowId, row) => {
    setData((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...row } : r)));
    setValidationMessage(`Row ${rowId} saved successfully!`);
    setTimeout(() => setValidationMessage(''), 3000);
  };

  const handleValidationFail = (rowId, errors) => {
    const errorMessages = errors.map((e) => `${e.field}: ${e.message || 'Invalid'}`).join(', ');
    setValidationMessage(`Validation failed for row ${rowId}: ${errorMessages}`);
  };

  const handleEditStart = (rowId, row) => {
    setValidationMessage('');
  };

  const handleEditCancel = (rowId) => {
    setValidationMessage('');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>React Data Grid – Conditional Editing</h1>
      <h2>Example with Row-Based Editing Rules</h2>
      <p>
        This example demonstrates conditional editing where columns are editable based on row conditions.
        Double-click a row to edit it. Notice that different columns are editable depending on the row's status:
      </p>
      <ul style={{ marginBottom: 16 }}>
        <li><strong>Project Name:</strong> Always editable</li>
        <li><strong>Status:</strong> Never editable (read-only)</li>
        <li><strong>Priority:</strong> Only editable for rows with status "Pending"</li>
        <li><strong>Assigned To:</strong> Editable for "Pending" and "In Progress" rows</li>
        <li><strong>Notes:</strong> Only editable for rows with status "Pending"</li>
        <li><strong>Budget:</strong> Only editable for rows with status "Pending"</li>
      </ul>
      <p style={{ marginBottom: 16, fontStyle: 'italic', color: '#666' }}>
        Try editing different rows to see how the editable columns change based on the status field.
        Validation only runs on columns that are editable for each row.
      </p>
      {validationMessage && (
        <div
          style={{
            padding: 12,
            marginBottom: 16,
            backgroundColor: validationMessage.includes('failed') ? '#ffebee' : '#e8f5e9',
            color: validationMessage.includes('failed') ? '#c62828' : '#2e7d32',
            borderRadius: 4,
            border: `1px solid ${validationMessage.includes('failed') ? '#ef5350' : '#66bb6a'}`,
          }}
        >
          {validationMessage}
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <DataGrid
          rows={data}
          columns={conditionalEditingColumns}
          getRowId={(row) => row.id}
          options={{
            gridId: 'conditional-editing-grid',
            translations: en,
            direction: DIRECTION_RTL,
            editable: true,
            pagination: true,
            pageSize: 10,
            pageSizeOptions: [5, 10, 25],
            onEditCommit: handleEditCommit,
            onEditStart: handleEditStart,
            onEditCancel: handleEditCancel,
            onValidationFail: handleValidationFail,
          }}
        />
      </div>
    </div>
  );
}
