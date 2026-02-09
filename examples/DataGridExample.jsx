import React, { useState, useMemo } from 'react';
import { DataGrid } from '../src/DataGrid/DataGrid';
import { columnsConfig, columnsConfigHebrew } from './columnsConfig';
import { sampleData } from './sampleData';
import { en } from './translations';

export function DataGridExample() {
  const [direction, setDirection] = useState('ltr');
  const [data, setData] = useState(sampleData);

  const columns = useMemo(() => {
    return direction === 'rtl' ? columnsConfigHebrew : columnsConfig;
  }, [direction]);

  const handleEditCommit = (rowId, row) => {
    setData((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...row } : r)));
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>React Data Grid – Examples</h1>
      <h2>All Features Combined</h2>
      <p>
        This example showcases all features working together: filtering, sorting, inline editing,
        multi-row selection, and pagination. Toggle direction for RTL/LTR.
      </p>
      <label>
        Direction:{' '}
        <select value={direction} onChange={(e) => setDirection(e.target.value)}>
          <option value="ltr">LTR</option>
          <option value="rtl">RTL</option>
        </select>
      </label>
      <div style={{ marginTop: 16 }}>
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.id}
          translations={en}
          direction={direction}
          multiSelectable
          editable
          pagination
          pageSize={10}
          pageSizeOptions={[5, 10, 25, 50]}
          onEditCommit={handleEditCommit}
        />
      </div>
    </div>
  );
}
