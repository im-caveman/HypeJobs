'use client';

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Box,
  Button,
  Skeleton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Bookmark,
  BookmarkBorder,
  Work,
  LocationOn,
  Schedule,
  AttachMoney,
  OpenInNew,
  Business,
  TrendingUp,
  Computer,
  Home,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Job, JobCardVariant } from '@/types';
import { savedJobsStorage } from '@/lib/utils/storage';

interface JobCardProps {
  job: Job;
  variant?: JobCardVariant;
  showSaveButton?: boolean;
  onApply?: (job: Job) => void;
  onSave?: (jobId: string, saved: boolean) => void;
  className?: string;
  compact?: boolean;
}

// Work arrangement icon mapping
const getWorkArrangementIcon = (arrangement?: string) => {
  switch (arrangement?.toLowerCase()) {
    case 'remote solely':
    case 'remote':
      return <Home />;
    case 'hybrid':
      return <Computer />;
    case 'on-site':
    default:
      return <LocationOn />;
  }
};

// Salary formatting
const formatSalary = (job: Job): string | null => {
  if (job.ai_salary_value) {
    const currency = job.ai_salary_currency || 'USD';
    const unit = job.ai_salary_unit || 'YEAR';
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(job.ai_salary_value);

    const unitSuffix = unit === 'YEAR' ? '/yr' : unit === 'HOUR' ? '/hr' : `/${unit.toLowerCase()}`;
    return `${formatted}${unitSuffix}`;
  }

  if (job.ai_salary_minvalue && job.ai_salary_maxvalue) {
    const currency = job.ai_salary_currency || 'USD';
    const unit = job.ai_salary_unit || 'YEAR';
    const minFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(job.ai_salary_minvalue);
    const maxFormatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(job.ai_salary_maxvalue);

    const unitSuffix = unit === 'YEAR' ? '/yr' : unit === 'HOUR' ? '/hr' : `/${unit.toLowerCase()}`;
    return `${minFormatted} - ${maxFormatted}${unitSuffix}`;
  }

  return null;
};

// Get employment type color
const getEmploymentTypeColor = (type: string): 'primary' | 'secondary' | 'success' | 'warning' | 'info' => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('full') || lowerType.includes('permanent')) return 'primary';
  if (lowerType.includes('part') || lowerType.includes('partial')) return 'secondary';
  if (lowerType.includes('contract') || lowerType.includes('freelance')) return 'warning';
  if (lowerType.includes('intern') || lowerType.includes('trainee')) return 'info';
  return 'default';
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  variant = 'default',
  showSaveButton = true,
  onApply,
  onSave,
  className,
  compact = false,
}) => {
  const theme = useTheme();
  const [isSaved, setIsSaved] = useState(() => savedJobsStorage.isJobSaved(job.id));
  const [saveInProgress, setSaveInProgress] = useState(false);

  // Handle save/unsave job
  const handleSaveToggle = useCallback(async (
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    event.preventDefault();

    if (saveInProgress) return;

    setSaveInProgress(true);
    try {
      const newSavedState = !isSaved;

      if (newSavedState) {
        const success = savedJobsStorage.saveJob(job.id);
        if (success) {
          setIsSaved(true);
        }
      } else {
        const success = savedJobsStorage.unsaveJob(job.id);
        if (success) {
          setIsSaved(false);
        }
      }

      // Call parent callback
      onSave?.(job.id, newSavedState);
    } catch (error) {
      console.error('Error toggling save state:', error);
    } finally {
      setSaveInProgress(false);
    }
  }, [isSaved, job.id, onSave]);

  // Handle apply click
  const handleApplyClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      onApply?.(job);
      // Open job URL in new tab if no onApply handler
      if (!onApply && job.url) {
        window.open(job.url, '_blank', 'noopener,noreferrer');
      }
    },
    [job, onApply]
  );

  // Get location display
  const getLocationDisplay = () => {
    if (job.remote_derived && job.ai_work_arrangement) {
      return `${job.ai_work_arrangement}`;
    }

    if (job.locations_derived.length > 0) {
      const location = job.locations_derived[0];
      if (location.city && location.admin) {
        return `${location.city}, ${location.admin}`;
      } else if (location.city) {
        return location.city;
      } else if (location.admin) {
        return location.admin;
      }
    }

    return 'Location not specified';
  };

  // Get company logo fallback
  const getCompanyLogo = () => {
    if (job.organization_logo && job.organization_logo.trim()) {
      return job.organization_logo;
    }
    return null;
  };

  // Get avatar initial
  const getAvatarInitial = () => {
    return job.organization.charAt(0).toUpperCase();
  };

  // Render skeleton for loading state
  if (job.id === 'skeleton') {
    return (
      <Card className={className} sx={{ height: variant === 'compact' ? 140 : 'auto' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
            <Box flex={1}>
              <Skeleton variant="text" height={24} width="80%" mb={1} />
              <Skeleton variant="text" height={16} width="60%" />
            </Box>
          </Box>
          <Skeleton variant="text" height={16} width="100%" mb={1} />
          <Skeleton variant="text" height={16} width="90%" mb={2} />
          <Box display="flex" gap={1} flexWrap="wrap">
            <Skeleton variant="rectangular" height={24} width={80} />
            <Skeleton variant="rectangular" height={24} width={100} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <Card
        className={className}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          height: 140,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
        }}
        onClick={() => window.open(job.url, '_blank')}
      >
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" alignItems="flex-start" mb={1}>
            <Avatar
              src={getCompanyLogo()}
              sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}
            >
              {getAvatarInitial()}
            </Avatar>
            <Box flex={1} overflow="hidden">
              <Typography
                variant="subtitle2"
                fontWeight={600}
                noWrap
                title={job.title}
              >
                {job.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {job.organization}
              </Typography>
            </Box>
            {showSaveButton && (
              <IconButton
                size="small"
                onClick={handleSaveToggle}
                disabled={saveInProgress}
                sx={{ ml: 1 }}
              >
                {isSaved ? <Bookmark color="primary" /> : <BookmarkBorder />}
              </IconButton>
            )}
          </Box>

          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <LocationOn fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {getLocationDisplay()}
            </Typography>
            {job.ai_work_arrangement && (
              <Chip
                icon={getWorkArrangementIcon(job.ai_work_arrangement)}
                label={job.ai_work_arrangement}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" mt="auto">
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(job.date_posted), { addSuffix: true })}
            </Typography>
            {job.ai_salary_value && (
              <Typography variant="caption" color="success.main" fontWeight={500}>
                {formatSalary(job)}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Featured variant
  if (variant === 'featured') {
    return (
      <Card
        className={className}
        sx={{
          cursor: 'pointer',
          position: 'relative',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
            border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          },
        }}
        onClick={() => window.open(job.url, '_blank')}
      >
        {/* Featured badge */}
        <Chip
          label="Featured"
          color="primary"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            fontWeight: 600,
            zIndex: 1,
          }}
        />

        <CardContent>
          <Box display="flex" alignItems="flex-start" mb={2}>
            <Avatar
              src={getCompanyLogo()}
              sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}
            >
              {getAvatarInitial()}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {job.title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Business fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {job.organization}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {getLocationDisplay()}
                  </Typography>
                </Box>
                {job.ai_work_arrangement && (
                  <Chip
                    icon={getWorkArrangementIcon(job.ai_work_arrangement)}
                    label={job.ai_work_arrangement}
                    size="small"
                    color="info"
                  />
                )}
              </Box>
            </Box>
            {showSaveButton && (
              <IconButton onClick={handleSaveToggle} disabled={saveInProgress}>
                {isSaved ? <Bookmark color="primary" /> : <BookmarkBorder />}
              </IconButton>
            )}
          </Box>

          {/* AI-enriched content */}
          {job.ai_core_responsibilities && (
            <Typography variant="body2" color="text.secondary" mb={2}>
              {job.ai_core_responsibilities}
            </Typography>
          )}

          {/* Salary and skills */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            {formatSalary(job) && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <AttachMoney fontSize="small" color="success" />
                <Typography variant="body2" color="success.main" fontWeight={600}>
                  {formatSalary(job)}
                </Typography>
              </Box>
            )}
            <Box display="flex" alignItems="center" gap={0.5}>
              <Schedule fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(job.date_posted), { addSuffix: true })}
              </Typography>
            </Box>
          </Box>

          {/* Key skills */}
          {job.ai_key_skills && job.ai_key_skills.length > 0 && (
            <Box display="flex" gap={0.5} flexWrap="wrap" mb={2}>
              {job.ai_key_skills.slice(0, 4).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
              {job.ai_key_skills.length > 4 && (
                <Chip
                  label={`+${job.ai_key_skills.length - 4} more`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Box>
          )}

          {/* Employment types */}
          {job.employment_type && job.employment_type.length > 0 && (
            <Box display="flex" gap={0.5} flexWrap="wrap">
              {job.employment_type.slice(0, 2).map((type, index) => (
                <Chip
                  key={index}
                  label={type.replace('_', ' ')}
                  size="small"
                  color={getEmploymentTypeColor(type)}
                  variant="filled"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            variant="contained"
            endIcon={<OpenInNew />}
            onClick={handleApplyClick}
            fullWidth
          >
            Apply Now
          </Button>
        </CardActions>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={className}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
      onClick={() => window.open(job.url, '_blank')}
    >
      <CardContent sx={{ flex: 1 }}>
        <Box display="flex" alignItems="flex-start" mb={2}>
          <Avatar
            src={getCompanyLogo()}
            sx={{ width: 48, height: 48, mr: 2, bgcolor: 'primary.main' }}
          >
            {getAvatarInitial()}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {job.title}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Business fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {job.organization}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {getLocationDisplay()}
                </Typography>
              </Box>
              {job.ai_work_arrangement && (
                <Chip
                  icon={getWorkArrangementIcon(job.ai_work_arrangement)}
                  label={job.ai_work_arrangement}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          {showSaveButton && (
            <Tooltip title={isSaved ? 'Saved' : 'Save job'}>
              <IconButton
                onClick={handleSaveToggle}
                disabled={saveInProgress}
                sx={{
                  color: isSaved ? theme.palette.primary.main : 'inherit',
                }}
              >
                {isSaved ? <Bookmark /> : <BookmarkBorder />}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Key information */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          {formatSalary(job) && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <AttachMoney fontSize="small" color="success" />
              <Typography variant="body2" color="success.main" fontWeight={500}>
                {formatSalary(job)}
              </Typography>
            </Box>
          )}
          <Box display="flex" alignItems="center" gap={0.5}>
            <Schedule fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(job.date_posted), { addSuffix: true })}
            </Typography>
          </Box>
        </Box>

        {/* Employment type chips */}
        {job.employment_type && job.employment_type.length > 0 && (
          <Box display="flex" gap={0.5} flexWrap="wrap" mb={2}>
            {job.employment_type.slice(0, 3).map((type, index) => (
              <Chip
                key={index}
                label={type.replace('_', ' ')}
                size="small"
                color={getEmploymentTypeColor(type)}
                variant="filled"
                sx={{ fontSize: '0.7rem', height: 24 }}
              />
            ))}
            {job.employment_type.length > 3 && (
              <Chip
                label={`+${job.employment_type.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 24 }}
              />
            )}
          </Box>
        )}

        {/* Key skills */}
        {job.ai_key_skills && job.ai_key_skills.length > 0 && (
          <Box display="flex" gap={0.5} flexWrap="wrap">
            {job.ai_key_skills.slice(0, 3).map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 24 }}
              />
            ))}
            {job.ai_key_skills.length > 3 && (
              <Chip
                label={`+${job.ai_key_skills.length - 3} skills`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 24 }}
              />
            )}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button
          variant="outlined"
          endIcon={<OpenInNew />}
          onClick={handleApplyClick}
          size="small"
        >
          View Job
        </Button>
        {formatSalary(job) && (
          <Typography variant="body2" color="success.main" fontWeight={600}>
            {formatSalary(job)}
          </Typography>
        )}
      </CardActions>
    </Card>
  );
};

export default JobCard;