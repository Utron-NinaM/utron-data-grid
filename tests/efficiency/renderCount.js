let count = 0;

export function getRenderCount() {
  return count;
}

export function incrementRenderCount() {  
  count += 1;  
}

export function resetRenderCount() {
  count = 0;
}
