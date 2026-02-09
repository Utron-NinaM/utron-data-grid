import React, { useState } from 'react';
import { DataGrid } from '../src/DataGrid/DataGrid';
import { editingValidationColumns } from './editingValidationColumns';
import { editingValidationData } from './editingValidationData';
import { en } from './translations';

export function EditingValidationExample() {
  const [data, setData] = useState(editingValidationData);
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
      <h1>React Data Grid – Editing with Validation</h1>
      <h2>Example with Field Validation</h2>
      <p>
        This example demonstrates inline editing with comprehensive validation rules. Double-click a row to edit it.
        Try entering invalid data to see validation errors:
      </p>
      <ul style={{ marginBottom: 16 }}>
        <li><strong>Name:</strong> Required, minimum 2 characters</li>
        <li><strong>Email:</strong> Required, must be valid email format</li>
        <li><strong>Age:</strong> Required, must be between 18 and 120</li>
        <li><strong>Salary:</strong> Required, must be between 0 and 1,000,000</li>
        <li><strong>Department:</strong> Required</li>
        <li><strong>Start Date:</strong> Required, cannot be in the future</li>
      </ul>
     
      <div style={{ marginTop: 16 }}>
        <DataGrid
          rows={data}
          columns={editingValidationColumns}
          getRowId={(row) => row.id}
          translations={en}
          direction="ltr"
          editable
          pagination
          pageSize={10}
          pageSizeOptions={[5, 10, 25]}
          onEditCommit={handleEditCommit}
          onEditStart={handleEditStart}
          onEditCancel={handleEditCancel}
          onValidationFail={handleValidationFail}          
        />
      </div>
    </div>
  );
}
