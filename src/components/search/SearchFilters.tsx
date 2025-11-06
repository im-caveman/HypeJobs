'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Slider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Autocomplete,
  Divider,
  InputAdornment,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  ExpandMore,
  Work,
  LocationOn,
  AttachMoney,
  Schedule,
  Business,
  School,
  Public,
  TrendingUp,
  Clear,
  FilterList,
  LocalOffer,
} from '@mui/icons-material';
import {
  JobFilters,
  EmploymentType,
  WorkArrangement,
  ExperienceLevel,
  TaxonomyCategory,
} from '@/types';
import {
  EMPLOYMENT_TYPES,
  WORK_ARRANGEMENTS,
  EXPERIENCE_LEVELS,
  POPULAR_CATEGORIES,
  POPULAR_LOCATIONS,
} from '@/lib/config';

interface SearchFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onReset: () => void;
  loading?: boolean;
  className?: string;
  compact?: boolean;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  loading = false,
  className,
  compact = false,
}) => {
  const theme = useTheme();
  const [expandedPanels, setExpandedPanels] = useState<string[]>([
    'employment',
    'work-arrangement',
  ]);

  // Handle panel expansion
  const handlePanelChange = useCallback((panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanels(prev =>
      isExpanded
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  }, []);

  // Update filters
  const updateFilters = useCallback((updates: Partial<JobFilters>) => {
    const newFilters = { ...filters, ...updates };
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  // Handle employment type change
  const handleEmploymentTypeChange = useCallback((type: EmploymentType, checked: boolean) => {
    const currentTypes = filters.employmentType || [];
    const updatedTypes = checked
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type);
    updateFilters({ employmentType: updatedTypes });
  }, [filters.employmentType, updateFilters]);

  // Handle work arrangement change
  const handleWorkArrangementChange = useCallback((arrangement: WorkArrangement, checked: boolean) => {
    const currentArrangements = filters.workArrangement || [];
    const updatedArrangements = checked
      ? [...currentArrangements, arrangement]
      : currentArrangements.filter(a => a !== arrangement);
    updateFilters({ workArrangement: updatedArrangements });
  }, [filters.workArrangement, updateFilters]);

  // Handle experience level change
  const handleExperienceLevelChange = useCallback((level: ExperienceLevel, checked: boolean) => {
    const currentLevels = filters.experienceLevel || [];
    const updatedLevels = checked
      ? [...currentLevels, level]
      : currentLevels.filter(l => l !== level);
    updateFilters({ experienceLevel: updatedLevels });
  }, [filters.experienceLevel, updateFilters]);

  // Handle categories change
  const handleCategoriesChange = useCallback((categories: TaxonomyCategory[]) => {
    updateFilters({ categories });
  }, [updateFilters]);

  // Handle salary change
  const handleSalaryChange = useCallback((event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    updateFilters({ salaryMin: min, salaryMax: max });
  }, [updateFilters]);

  // Get active filters count
  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.employmentType?.length) count++;
    if (filters.workArrangement?.length) count++;
    if (filters.experienceLevel?.length) count++;
    if (filters.categories?.length) count++;
    if (filters.salaryMin || filters.salaryMax) count++;
    if (filters.remote !== undefined) count++;
    if (filters.visaSponsorship) count++;
    if (filters.ai_has_salary) count++;
    return count;
  }, [filters]);

  const activeFiltersCount = getActiveFiltersCount();

  if (compact) {
    return (
      <Box className={className}>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <Chip
            icon={<FilterList />}
            label={`${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''} applied`}
            color="primary"
            variant="outlined"
            size="small"
          />
          {filters.employmentType?.slice(0, 2).map((type) => (
            <Chip
              key={type}
              label={type.replace('_', ' ')}
              onDelete={() => handleEmploymentTypeChange(type as EmploymentType, false)}
              size="small"
            />
          ))}
          {filters.remote && (
            <Chip
              label="Remote"
              onDelete={() => updateFilters({ remote: undefined })}
              size="small"
            />
          )}
          <Button size="small" onClick={onReset}>
            Clear all
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Card className={className}>
      <CardContent sx={{ p: compact ? 2 : 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={600} display="flex" alignItems="center" gap={1}>
            <FilterList />
            Filters
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={onReset}
            startIcon={<Clear />}
            disabled={loading}
          >
            Reset
          </Button>
        </Box>

        {/* Remote Work Toggle */}
        <Box mb={3}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.remote || false}
                onChange={(e) => updateFilters({ remote: e.target.checked })}
                color="primary"
              />
            }
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Public fontSize="small" />
                <Typography>Remote jobs only</Typography>
              </Box>
            }
          />
        </Box>

        {/* Employment Type */}
        <Accordion
          expanded={expandedPanels.includes('employment')}
          onChange={handlePanelChange('employment')}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <Work />
              <Typography variant="subtitle2" fontWeight={500}>
                Employment Type
                {filters.employmentType?.length && (
                  <Chip
                    label={filters.employmentType.length}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl component="fieldset">
              <FormGroup>
                {EMPLOYMENT_TYPES.map((type) => (
                  <FormControlLabel
                    key={type.value}
                    control={
                      <Checkbox
                        checked={filters.employmentType?.includes(type.value as EmploymentType) || false}
                        onChange={(e) => handleEmploymentTypeChange(type.value as EmploymentType, e.target.checked)}
                        size="small"
                      />
                    }
                    label={type.label}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        {/* Work Arrangement */}
        <Accordion
          expanded={expandedPanels.includes('work-arrangement')}
          onChange={handlePanelChange('work-arrangement')}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn />
              <Typography variant="subtitle2" fontWeight={500}>
                Work Arrangement
                {filters.workArrangement?.length && (
                  <Chip
                    label={filters.workArrangement.length}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl component="fieldset">
              <FormGroup>
                {WORK_ARRANGEMENTS.map((arrangement) => (
                  <FormControlLabel
                    key={arrangement.value}
                    control={
                      <Checkbox
                        checked={filters.workArrangement?.includes(arrangement.value as WorkArrangement) || false}
                        onChange={(e) => handleWorkArrangementChange(arrangement.value as WorkArrangement, e.target.checked)}
                        size="small"
                      />
                    }
                    label={arrangement.label}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        {/* Experience Level */}
        <Accordion
          expanded={expandedPanels.includes('experience')}
          onChange={handlePanelChange('experience')}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUp />
              <Typography variant="subtitle2" fontWeight={500}>
                Experience Level
                {filters.experienceLevel?.length && (
                  <Chip
                    label={filters.experienceLevel.length}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl component="fieldset">
              <FormGroup>
                {EXPERIENCE_LEVELS.map((level) => (
                  <FormControlLabel
                    key={level.value}
                    control={
                      <Checkbox
                        checked={filters.experienceLevel?.includes(level.value as ExperienceLevel) || false}
                        onChange={(e) => handleExperienceLevelChange(level.value as ExperienceLevel, e.target.checked)}
                        size="small"
                      />
                    }
                    label={level.label}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        {/* Job Categories */}
        <Accordion
          expanded={expandedPanels.includes('categories')}
          onChange={handlePanelChange('categories')}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <LocalOffer />
              <Typography variant="subtitle2" fontWeight={500}>
                Categories
                {filters.categories?.length && (
                  <Chip
                    label={filters.categories.length}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Autocomplete
              multiple
              options={POPULAR_CATEGORIES}
              value={filters.categories || []}
              onChange={(_, newValue) => handleCategoriesChange(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select categories"
                  variant="outlined"
                  size="small"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
              limitTags={5}
            />
          </AccordionDetails>
        </Accordion>

        {/* Salary Range */}
        <Accordion
          expanded={expandedPanels.includes('salary')}
          onChange={handlePanelChange('salary')}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoney />
              <Typography variant="subtitle2" fontWeight={500}>
                Salary Range
                {(filters.salaryMin || filters.salaryMax) && (
                  <Chip
                    label="Set"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Annual salary range (USD)
              </Typography>
              <Slider
                value={[
                  filters.salaryMin || 0,
                  filters.salaryMax || 200000,
                ]}
                onChange={handleSalaryChange}
                valueLabelDisplay="auto"
                min={0}
                max={300000}
                step={10000}
                marks={[
                  { value: 0, label: '$0' },
                  { value: 50000, label: '$50k' },
                  { value: 100000, label: '$100k' },
                  { value: 150000, label: '$150k' },
                  { value: 200000, label: '$200k' },
                  { value: 300000, label: '$300k+' },
                ]}
                sx={{ mt: 2 }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Additional Filters */}
        <Accordion
          expanded={expandedPanels.includes('additional')}
          onChange={handlePanelChange('additional')}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" gap={1}>
              <School />
              <Typography variant="subtitle2" fontWeight={500}>
                Additional Filters
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl component="fieldset">
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.visaSponsorship || false}
                      onChange={(e) => updateFilters({ visaSponsorship: e.target.checked })}
                      size="small"
                    />
                  }
                  label="Visa sponsorship available"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.ai_has_salary || false}
                      onChange={(e) => updateFilters({ ai_has_salary: e.target.checked })}
                      size="small"
                    />
                  }
                  label="Jobs with salary information only"
                />
              </FormGroup>
            </FormControl>

            {/* Company Size */}
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Company Size
              </Typography>
              <FormControl component="fieldset">
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox size="small" />}
                    label="Startup (1-50 employees)"
                  />
                  <FormControlLabel
                    control={<Checkbox size="small" />}
                    label="Small (51-200 employees)"
                  />
                  <FormControlLabel
                    control={<Checkbox size="small" />}
                    label="Medium (201-1000 employees)"
                  />
                  <FormControlLabel
                    control={<Checkbox size="small" />}
                    label="Large (1000+ employees)"
                  />
                </FormGroup>
              </FormControl>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 2 }} />

        {/* Apply Filters Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={() => onFiltersChange(filters)}
          disabled={loading}
          startIcon={<FilterList />}
        >
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;