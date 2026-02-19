import React from 'react';
import { TextField } from '@mui/material';

const MAX_INPUT_LENGTH = 50;
const NUMBER_INPUT_REGEX = /^-?\d*\.?\d*$/;
const INTEGER_INPUT_REGEX = /^\d*$/;

/** Controlled text field that only allows numeric input. Uses type="text" + regex to avoid browser number input quirks. */
export function NumericTextField({
  value,
  onChange,
  integerOnly = false,
  inputProps = {},
  ...textFieldProps
}) {
  const regex = integerOnly ? INTEGER_INPUT_REGEX : NUMBER_INPUT_REGEX;

  const handleChange = (e) => {
    const raw = e.target.value;
    if (raw === '' || regex.test(raw)) onChange(raw);
  };

  return (
    <TextField
      {...textFieldProps}
      type="text"
      value={value}
      onChange={handleChange}
      inputProps={{ maxLength: MAX_INPUT_LENGTH, ...inputProps }}
    />
  );
}
