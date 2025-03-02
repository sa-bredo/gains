import React, { memo } from 'react';

// Create a memoized component to break potential recursive render cycles
export const MemoizedShiftComponent = memo(function MemoizedShiftComponent(props: any) {
  return props.children;
});

// Note: The original shifts/index.tsx should import this component
// and wrap any components causing recursion with it.
