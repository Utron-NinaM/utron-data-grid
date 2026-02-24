import React from 'react';
import { BooleanEditor } from './BooleanEditor';
import { NumberEditor } from './NumberEditor';
import { StringEditor } from './StringEditor';
import { SelectEditor } from './SelectEditor';
import { JsonEditor } from './JsonEditor';
import { NumberArrayEditor } from './NumberArrayEditor';

const editors = {
  boolean: BooleanEditor,
  number: NumberEditor,
  string: StringEditor,
  select: SelectEditor,
  json: JsonEditor,
  numberArray: NumberArrayEditor,
};

export function OptionEditor({ definition, value, onChange }) {
  const Editor = editors[definition.type];
  if (!Editor) return null;
  return (
    <Editor
      definition={definition}
      value={value}
      onChange={(v) => onChange(definition.key, v)}
    />
  );
}
