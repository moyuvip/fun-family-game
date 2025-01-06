import React from 'react';
import Masonry from 'react-masonry-css';

interface MasonryGridProps {
  children: React.ReactNode;
  className?: string;
}

const breakpointColumns = {
  default: 4,
  1536: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 1
};

const MasonryGrid: React.FC<MasonryGridProps> = ({ children, className = '' }) => {
  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className={`flex -ml-6 w-auto ${className}`}
      columnClassName="pl-6 bg-clip-padding"
    >
      {children}
    </Masonry>
  );
};

export default MasonryGrid; 