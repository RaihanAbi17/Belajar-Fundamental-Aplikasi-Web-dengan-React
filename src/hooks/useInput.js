import { useState } from 'react';

export function useInput(defaultValue = '') {
  const [value, setValue] = useState(defaultValue);

  const onChange = (event) => setValue(event.target.value);

  return [value, onChange, setValue];
}
