export function getOptionLabel(option) {
  return typeof option === 'object' && option != null && option.label != null 
    ? option.label 
    : String(option);
}
