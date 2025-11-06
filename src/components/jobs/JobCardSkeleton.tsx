'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Skeleton,
  Box,
} from '@mui/material';
import { JobCardVariant } from '@/types';

interface JobCardSkeletonProps {
  variant?: JobCardVariant;
  count?: number;
}

export const JobCardSkeleton: React.FC<JobCardSkeletonProps> = ({
  variant = 'default',
  count = 1,
}) => {
  const renderSkeleton = (index: number) => {
    const height = variant === 'compact' ? 140 : variant === 'featured' ? 300 : 'auto';

    return (
      <Card
        key={index}
        sx={{
          height,
          mb: index < count - 1 ? 2 : 0,
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="flex-start" mb={2}>
            <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
            <Box flex={1}>
              <Skeleton variant="text" height={24} width="80%" mb={1} />
              <Skeleton variant="text" height={16} width="60%" mb={1} />
              <Box display="flex" alignItems="center" gap={1}>
                <Skeleton variant="text" height={14} width="40%" />
                <Skeleton variant="rectangular" width={80} height={20} />
              </Box>
            </Box>
            <Skeleton variant="circular" width={40} height={40} />
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Skeleton variant="text" height={16} width="30%" />
            <Skeleton variant="text" height={14} width="20%" />
          </Box>

          <Box display="flex" gap={0.5} flexWrap="wrap" mb={2}>
            <Skeleton variant="rectangular" width={80} height={24} />
            <Skeleton variant="rectangular" width={100} height={24} />
            <Skeleton variant="rectangular" width={70} height={24} />
          </Box>

          <Box display="flex" gap={0.5} flexWrap="wrap">
            <Skeleton variant="rectangular" width={60} height={20} />
            <Skeleton variant="rectangular" width={80} height={20} />
            <Skeleton variant="rectangular" width={90} height={20} />
            <Skeleton variant="rectangular" width={50} height={20} />
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </>
  );
};

export default JobCardSkeleton;