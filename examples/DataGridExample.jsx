import React, { useState, useMemo } from 'react';
import { DataGrid } from '../src/DataGrid/DataGrid';
import { columnsConfig, columnsConfigHebrew } from './columnsConfig';
import { sampleData } from './sampleData';
import { en } from './translations';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { DIRECTION_RTL, DIRECTION_LTR } from '../src/config/schema';

export function DataGridExample() {
  const [direction, setDirection] = useState(DIRECTION_RTL);
  const [data, setData] = useState(sampleData);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [doubleClickedRow, setDoubleClickedRow] = useState(null);

  const columns = useMemo(() => {
    return direction === DIRECTION_RTL ? columnsConfigHebrew : columnsConfig;
  }, [direction]);

  const handleEditCommit = (rowId, row) => {
    setData((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...row } : r)));
  };

  const handleRowSelect = (rowId, row) => {
    console.log('row selected', row);
    setSelectedRow(row);
  };

  const handleCancelOrder = () => {
    if (selectedRow) {
      setData((prev) => prev.filter((r) => r.id !== selectedRow.id));
      setSelectedRow(null);
    }
  };

  const handleRowDoubleClick = (row) => {
    setDoubleClickedRow(row);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setDoubleClickedRow(null);
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
          <option value={DIRECTION_LTR}>LTR</option>
          <option value={DIRECTION_RTL}>RTL</option>
        </select>
      </label>
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <Button
          variant="contained"
          color="error"
          onClick={handleCancelOrder}
          disabled={!selectedRow}
        >
          Cancel Order
        </Button>
      </div>
      <div style={{ marginTop: 16 }}>
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.id}
          options={{
            gridId: 'orders-grid',
            translations: en,
            direction,
            multiSelectable: true,
            editable: true,
            pagination: true,
            pageSize: 10,
            pageSizeOptions: [5, 10, 25, 50, 100],
            onEditCommit: handleEditCommit,
            onRowSelect: handleRowSelect,
            onRowDoubleClick: handleRowDoubleClick,
            headerConfig: {
              mainRow: { backgroundColor: 'rgb(255, 204, 8)', height: 30 },
              filterRows: { backgroundColor: 'rgb(250, 250, 250)', height: 30 },
              filterCells: { backgroundColor: 'rgb(250, 250, 250)', height: 30 },
            },
            selectedRowStyle: { backgroundColor: 'rgb(129, 124, 124)' },
          }}
        />
      </div>
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Row Details</DialogTitle>
        <DialogContent>
          {doubleClickedRow && (
            <DialogContentText component="div">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div><strong>ID:</strong> {doubleClickedRow.id}</div>
                <div><strong>Make:</strong> {doubleClickedRow.make}</div>
                <div><strong>Model:</strong> {doubleClickedRow.model}</div>
                <div><strong>Year:</strong> {doubleClickedRow.year}</div>
                <div><strong>Price:</strong> ${doubleClickedRow.price?.toLocaleString()}</div>
                <div><strong>Color:</strong> {doubleClickedRow.color}</div>
                <div><strong>Electric:</strong> {doubleClickedRow.electric}</div>
                <div><strong>Status:</strong> {doubleClickedRow.status}</div>
                {doubleClickedRow.description && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Description:</strong>
                    <div style={{ marginTop: 4, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                      {doubleClickedRow.description}
                    </div>
                  </div>
                )}
                {doubleClickedRow.createdAt && (
                  <div><strong>Created At:</strong> {doubleClickedRow.createdAt}</div>
                )}
              </div>
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
