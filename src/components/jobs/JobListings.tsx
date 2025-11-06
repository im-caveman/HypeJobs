'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  ViewList,
  ViewModule,
  Sort,
  KeyboardArrowDown,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import { Job, JobCardVariant, JobFilters } from '@/types';
import { JobCard, JobCardSkeleton } from '@/components/jobs';
import { UI_CONFIG } from '@/lib/config';

interface JobListingsProps {
  jobs: Job[];
  loading?: boolean;
  error?: string | null;
  totalCount?: number;
  onLoadMore?: () => void;
  onRetry?: () => void;
  onJobApply?: (job: Job) => void;
  onJobSave?: (jobId: string, saved: boolean) => void;
  variant?: JobCardVariant;
  showPagination?: boolean;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  hasMore?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  showLoadMore?: boolean;
  sortBy?: 'date' | 'relevance' | 'salary';
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  layout?: 'grid' | 'list';
  onLayoutChange?: (layout: 'grid' | 'list') => void;
  className?: string;
  compact?: boolean;
}

export const JobListings: React.FC<JobListingsProps> = ({
  jobs,
  loading = false,
  error = null,
  totalCount = 0,
  onLoadMore,
  onRetry,
  onJobApply,
  onJobSave,
  variant = 'default',
  showPagination = false,
  itemsPerPage = UI_CONFIG.pagination.defaultPageSize,
  currentPage = 1,
  onPageChange,
  hasMore = false,
  emptyMessage = 'No jobs found',
  emptyDescription = 'Try adjusting your filters or search terms',
  showLoadMore = true,
  sortBy = 'date',
  sortOrder = 'desc',
  onSortChange,
  layout = 'grid',
  onLayoutChange,
  className,
  compact = false,
}) => {
  const theme = useTheme();
  const [selectedSort, setSelectedSort] = useState(`${sortBy}-${sortOrder}`);

  // Get grid columns based on layout
  const getGridColumns = () => {
    if (layout === 'list') return 1;
    if (compact) return { xs: 1, sm: 2, md: 2, lg: 3 };
    return { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 };
  };

  // Handle sort change
  const handleSortChange = useCallback((event: any) => {
    const [newSortBy, newSortOrder] = event.target.value.split('-');
    setSelectedSort(event.target.value);
    onSortChange?.(newSortBy, newSortOrder as 'asc' | 'desc');
  }, [onSortChange]);

  // Handle layout toggle
  const handleLayoutToggle = useCallback(() => {
    const newLayout = layout === 'grid' ? 'list' : 'grid';
    onLayoutChange?.(newLayout);
  }, [layout, onLayoutChange]);

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalCount);

  // Loading state
  if (loading && jobs.length === 0) {
    return (
      <Box className={className}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h6" fontWeight={600}>
            Searching for jobs...
          </Typography>
          <CircularProgress size={24} />
        </Box>

        {/* Loading skeleton */}
        <Grid container spacing={2}>
          {Array.from({ length: compact ? 6 : 8 }, (_, index) => (
            <Grid item {...getGridColumns()} key={index}>
              <JobCardSkeleton variant={compact ? 'compact' : variant} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Error state
  if (error && jobs.length === 0) {
    return (
      <Box className={className}>
        <Alert
          severity="error"
          action={
            onRetry && (
              <Button color="inherit" size="small" onClick={onRetry}>
                Retry
              </Button>
            )
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (!loading && jobs.length === 0) {
    return (
      <Box className={className}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
          textAlign="center"
        >
          <FilterList sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {emptyMessage}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {emptyDescription}
          </Typography>
          {onRetry && (
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={onRetry}
              sx={{ mt: 2 }}
            >
              Refresh
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box className={className}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {totalCount > 0 ? (
              <>
                {totalCount.toLocaleString()} job{totalCount !== 1 ? 's' : ''} found
                {totalCount > itemsPerPage && (
                  <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                    Showing {startIndex}-{endIndex}
                  </Typography>
                )}
              </>
            ) : (
              'Job Listings'
            )}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          {/* Sort dropdown */}
          {onSortChange && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort</InputLabel>
              <Select
                value={selectedSort}
                onChange={handleSortChange}
                label="Sort"
                startAdornment={<Sort sx={{ mr: 1, color: 'action' }} />}
              >
                <MenuItem value="date-desc">Most Recent</MenuItem>
                <MenuItem value="date-asc">Oldest First</MenuItem>
                <MenuItem value="relevance-desc">Most Relevant</MenuItem>
                <MenuItem value="salary-desc">Highest Salary</MenuItem>
                <MenuItem value="salary-asc">Lowest Salary</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Layout toggle */}
          {onLayoutChange && (
            <Tooltip title={`Switch to ${layout === 'grid' ? 'list' : 'grid'} view`}>
              <IconButton onClick={handleLayoutToggle} size="small">
                {layout === 'grid' ? <ViewList /> : <ViewModule />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Jobs Grid/List */}
      <Fade in timeout={300}>
        <Grid container spacing={2}>
          {jobs.map((job, index) => (
            <Grid item {...getGridColumns()} key={job.id || index}>
              <JobCard
                job={job}
                variant={compact ? 'compact' : variant}
                onApply={onJobApply}
                onSave={onJobSave}
                showSaveButton
              />
            </Grid>
          ))}

          {/* Loading skeleton for load more */}
          {loading && hasMore && (
            <>
              {Array.from({ length: compact ? 3 : 4 }, (_, index) => (
                <Grid item {...getGridColumns()} key={`loading-${index}`}>
                  <JobCardSkeleton variant={compact ? 'compact' : variant} />
                </Grid>
              ))}
            </>
          )}
        </Grid>
      </Fade>

      {/* Load More Button */}
      {showLoadMore && hasMore && !loading && onLoadMore && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="outlined"
            onClick={onLoadMore}
            startIcon={<KeyboardArrowDown />}
            size="large"
            sx={{ minWidth: 160 }}
          >
            Load More Jobs
          </Button>
        </Box>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && onPageChange && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={4} gap={2}>
          <Button
            variant="outlined"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>

          <Typography variant="body2" color="text.secondary">
            Page {currentPage} of {totalPages}
          </Typography>

          <Button
            variant="outlined"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </Box>
      )}

      {/* Loading indicator for infinite scroll */}
      {loading && hasMore && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Loading more jobs...
          </Typography>
        </Box>
      )}

      {/* End of results */}
      {!loading && !hasMore && jobs.length > 0 && (
        <Box textAlign="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            You've reached the end of the results
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Showing {jobs.length} of {totalCount.toLocaleString()} jobs
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default JobListings;