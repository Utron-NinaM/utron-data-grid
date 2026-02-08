import React, { useState } from 'react';
import { DataGridExample } from './DataGridExample';
import { EditingValidationExample } from './EditingValidationExample';

const examples = [
  { id: 'all-features', name: 'All Features', component: DataGridExample },
  { id: 'editing-validation', name: 'Editing & Validation', component: EditingValidationExample },
];

export function ExampleMenu() {
  const [selectedExample, setSelectedExample] = useState('all-features');

  const ExampleComponent = examples.find((e) => e.id === selectedExample)?.component || DataGridExample;

  return (
    <div>
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>Examples:</h2>
        {examples.map((example) => (
          <button
            key={example.id}
            onClick={() => setSelectedExample(example.id)}
            style={{
              padding: '8px 16px',
              border: selectedExample === example.id ? '2px solid #1976d2' : '1px solid #ccc',
              backgroundColor: selectedExample === example.id ? '#e3f2fd' : '#fff',
              color: selectedExample === example.id ? '#1976d2' : '#333',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: selectedExample === example.id ? 'bold' : 'normal',
            }}
          >
            {example.name}
          </button>
        ))}
      </div>
      <ExampleComponent />
    </div>
  );
}
