import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  height?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3, height = '40px' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton" style={{ width: '100%', height }} />
      ))}
    </div>
  );
};
