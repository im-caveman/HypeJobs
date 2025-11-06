'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Grid,
  Skeleton,
  Alert,
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
  Business,
  School,
  TrendingUp,
  OpenInNew,
  Share,
  Public,
  Home,
  Computer,
  LocalOffer,
  Language,
  People,
  Description,
  CheckCircle,
  Launch,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Job } from '@/types';
import { savedJobsStorage } from '@/lib/utils/storage';
import { EMPLOYMENT_TYPES, WORK_ARRANGEMENTS, EXPERIENCE_LEVELS } from '@/lib/config';

interface JobDetailsProps {
  job: Job;
  loading?: boolean;
  error?: string | null;
  onApply?: (job: Job) => void;
  onSave?: (jobId: string, saved: boolean) => void;
  onShare?: (job: Job) => void;
  similarJobs?: Job[];
  onSimilarJobClick?: (job: Job) => void;
  className?: string;
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

// Employment type color mapping
const getEmploymentTypeColor = (type: string): 'primary' | 'secondary' | 'success' | 'warning' | 'info' => {
  const lowerType = type.toLowerCase();
  if (lowerType.includes('full') || lowerType.includes('permanent')) return 'primary';
  if (lowerType.includes('part') || lowerType.includes('partial')) return 'secondary';
  if (lowerType.includes('contract') || lowerType.includes('freelance')) return 'warning';
  if (lowerType.includes('intern') || lowerType.includes('trainee')) return 'info';
  return 'default';
};

// Format salary
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

export const JobDetails: React.FC<JobDetailsProps> = ({
  job,
  loading = false,
  error = null,
  onApply,
  onSave,
  onShare,
  similarJobs = [],
  onSimilarJobClick,
  className,
}) => {
  const theme = useTheme();
  const [isSaved, setIsSaved] = useState(() => savedJobsStorage.isJobSaved(job.id));
  const [saveInProgress, setSaveInProgress] = useState(false);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (event: CustomEvent) => {
      if (event.detail.jobId === job.id) {
        setIsSaved(event.detail.saved);
      }
    };

    window.addEventListener('jobSaved', handleStorageChange as EventListener);
    window.addEventListener('jobUnsaved', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('jobSaved', handleStorageChange as EventListener);
      window.removeEventListener('jobUnsaved', handleStorageChange as EventListener);
    };
  }, [job.id]);

  // Handle save/unsave job
  const handleSaveToggle = useCallback(async () => {
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

  // Handle apply
  const handleApply = useCallback(() => {
    onApply?.(job);
    // Open job URL in new tab if no onApply handler
    if (!onApply && job.url) {
      window.open(job.url, '_blank', 'noopener,noreferrer');
    }
  }, [job, onApply]);

  // Handle share
  const handleShare = useCallback(() => {
    if (navigator.share && job.url) {
      navigator.share({
        title: `${job.title} at ${job.organization}`,
        text: job.ai_core_responsibilities || 'Check out this job opportunity',
        url: job.url,
      });
    } else {
      // Fallback to copying to clipboard
      if (job.url) {
        navigator.clipboard.writeText(job.url);
      }
    }
    onShare?.(job);
  }, [job, onShare]);

  // Loading state
  if (loading) {
    return (
      <Box className={className}>
        <Card>
          <CardContent>
            {/* Header skeleton */}
            <Box display="flex" alignItems="flex-start" mb={3}>
              <Skeleton variant="circular" width={64} height={64} sx={{ mr: 2 }} />
              <Box flex={1}>
                <Skeleton variant="text" height={32} width="80%" mb={1} />
                <Skeleton variant="text" height={20} width="60%" mb={1} />
                <Skeleton variant="text" height={16} width="40%" />
              </Box>
            </Box>

            {/* Content skeleton */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Skeleton variant="rectangular" height={200} mb={2} />
                <Skeleton variant="rectangular" height={150} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={300} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box className={className}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

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

  // Get company logo
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

  return (
    <Box className={className}>
      {/* Job Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="flex-start" mb={3}>
            <Avatar
              src={getCompanyLogo()}
              sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main' }}
            >
              {getAvatarInitial()}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                {job.title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Business fontSize="small" color="action" />
                <Typography variant="h6" color="text.secondary">
                  {job.organization}
                </Typography>
                {job.linkedin_org_url && (
                  <Tooltip title="View on LinkedIn">
                    <IconButton
                      size="small"
                      onClick={() => window.open(job.linkedin_org_url, '_blank')}
                    >
                      <Language fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
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
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {formatDistanceToNow(new Date(job.date_posted), { addSuffix: true })}
                  </Typography>
                </Box>
              </Box>

              {/* Action buttons */}
              <Box display="flex" alignItems="center" gap={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleApply}
                  endIcon={<Launch />}
                  sx={{ minWidth: 140 }}
                >
                  Apply Now
                </Button>
                <Tooltip title={isSaved ? 'Remove from saved' : 'Save job'}>
                  <IconButton
                    onClick={handleSaveToggle}
                    disabled={saveInProgress}
                    color={isSaved ? 'primary' : 'default'}
                    size="large"
                  >
                    {isSaved ? <Bookmark /> : <BookmarkBorder />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share job">
                  <IconButton onClick={handleShare} size="large">
                    <Share />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {/* Quick info chips */}
          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
            {job.employment_type?.slice(0, 3).map((type, index) => (
              <Chip
                key={index}
                label={type.replace('_', ' ')}
                color={getEmploymentTypeColor(type)}
                variant="filled"
                size="small"
              />
            ))}
            {job.source && (
              <Chip
                icon={<Business />}
                label={`via ${job.source}`}
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* AI Insights */}
          {(job.ai_core_responsibilities || job.ai_requirements_summary) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                  AI-Powered Insights
                </Typography>

                {job.ai_core_responsibilities && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" fontWeight={500} gutterBottom>
                      Core Responsibilities
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {job.ai_core_responsibilities}
                    </Typography>
                  </Box>
                )}

                {job.ai_requirements_summary && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={500} gutterBottom>
                      Key Requirements
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {job.ai_requirements_summary}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Job Description */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                Job Description
              </Typography>
              {job.description_text ? (
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    '& p': { mb: 2 },
                    '& ul': { mb: 2 },
                    '& ol': { mb: 2 },
                  }}
                >
                  {job.description_text}
                </Typography>
              ) : job.description_html ? (
                <Box
                  dangerouslySetInnerHTML={{ __html: job.description_html }}
                  sx={{
                    '& *': { maxWidth: '100%' },
                    '& img': { maxWidth: '100%', height: 'auto' },
                    '& a': { color: theme.palette.primary.main },
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No description available
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Key Skills */}
          {job.ai_key_skills && job.ai_key_skills.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <LocalOffer sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Key Skills & Technologies
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {job.ai_key_skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      variant="outlined"
                      color="primary"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Similar Jobs */}
          {similarJobs.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Similar Jobs
                </Typography>
                <Box display="flex" gap={2} overflow="auto" pb={1}>
                  {similarJobs.map((similarJob) => (
                    <Paper
                      key={similarJob.id}
                      sx={{
                        minWidth: 280,
                        p: 2,
                        cursor: 'pointer',
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: theme.shadows[2],
                        },
                      }}
                      onClick={() => onSimilarJobClick?.(similarJob)}
                    >
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        {similarJob.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {similarJob.organization}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {getLocationDisplay()}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Salary & Benefits */}
          {(formatSalary(job) || job.ai_benefits) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Compensation & Benefits
                </Typography>

                {formatSalary(job) && (
                  <Box mb={2}>
                    <Typography variant="h5" color="success.main" fontWeight={600}>
                      {formatSalary(job)}
                    </Typography>
                  </Box>
                )}

                {job.ai_benefits && job.ai_benefits.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={500} gutterBottom>
                      Benefits
                    </Typography>
                    <List dense>
                      {job.ai_benefits.slice(0, 5).map((benefit, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={benefit}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                      {job.ai_benefits.length > 5 && (
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={`+${job.ai_benefits.length - 5} more benefits`}
                            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Job Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Job Details
              </Typography>
              <List dense>
                {job.ai_experience_level && (
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <TrendingUp fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Experience Level"
                      secondary={job.ai_experience_level}
                    />
                  </ListItem>
                )}

                {job.ai_working_hours && (
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Schedule fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Working Hours"
                      secondary={`${job.ai_working_hours} hours/week`}
                    />
                  </ListItem>
                )}

                {job.ai_education_requirements && job.ai_education_requirements.length > 0 && (
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <School fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Education"
                      secondary={job.ai_education_requirements.join(', ')}
                    />
                  </ListItem>
                )}

                {job.ai_visa_sponsorship && (
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Public fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Visa Sponsorship"
                      secondary="Available"
                      secondaryTypographyProps={{ color: 'success.main' }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Company Information */}
          {(job.linkedin_org_employees || job.linkedin_org_industry || job.linkedin_org_description) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Company Information
                </Typography>

                {job.linkedin_org_employees && (
                  <Box mb={2}>
                    <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                      <People fontSize="small" color="action" />
                      <Typography variant="subtitle2" fontWeight={500}>
                        Company Size
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {job.linkedin_org_employees.toLocaleString()} employees
                    </Typography>
                  </Box>
                )}

                {job.linkedin_org_industry && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" fontWeight={500} gutterBottom>
                      Industry
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {job.linkedin_org_industry}
                    </Typography>
                  </Box>
                )}

                {job.linkedin_org_description && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={500} gutterBottom>
                      About Company
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {job.linkedin_org_description}
                    </Typography>
                  </Box>
                )}

                {job.linkedin_org_url && (
                  <Box mt={2}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Language />}
                      onClick={() => window.open(job.linkedin_org_url, '_blank')}
                    >
                      View on LinkedIn
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Job Source */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Source Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This job was posted via {job.source} and is indexed from {job.organization_url || 'the company career site'}.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JobDetails;