'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  InputAdornment,
  IconButton,
  Paper,
  Popper,
  Button,
  Typography,
  Chip,
  useTheme,
  alpha,
  ClickAwayListener,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Work,
  Clear,
  MyLocation,
  History,
  TrendingUp,
} from '@mui/icons-material';
import { JobFilters } from '@/types';
import {
  POPULAR_LOCATIONS,
  POPULAR_JOB_TITLES,
  SEARCH_CONFIG
} from '@/lib/config';
import { useRecentSearches } from '@/lib/contexts/SearchContext';

interface SearchBarProps {
  onSearch: (filters: JobFilters) => void;
  loading?: boolean;
  placeholder?: string;
  showLocation?: boolean;
  defaultValue?: JobFilters;
  autoFocus?: boolean;
  size?: 'small' | 'medium';
  variant?: 'outlined' | 'filled' | 'standard';
  className?: string;
}

interface SuggestionItem {
  type: 'recent' | 'popular' | 'location' | 'title';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  filters: JobFilters;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  loading = false,
  placeholder = 'Search jobs by title, skills, or keywords...',
  showLocation = true,
  defaultValue = {},
  autoFocus = false,
  size = 'medium',
  variant = 'outlined',
  className,
}) => {
  const theme = useTheme();
  const { recentSearches, applyRecentSearch } = useRecentSearches();

  // State management
  const [keywords, setKeywords] = useState(defaultValue.keywords || '');
  const [location, setLocation] = useState(defaultValue.location || '');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Refs
  const searchRef = useRef<HTMLDivElement>(null);
  const keywordsRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);

  // Get current user location
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode these coordinates
          // For now, we'll just set a generic location
          setLocation('Current Location');
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to asking user
        }
      );
    }
  }, []);

  // Generate suggestions based on input
  const generateSuggestions = useCallback((inputValue: string): SuggestionItem[] => {
    const suggestions: SuggestionItem[] = [];
    const value = inputValue.toLowerCase().trim();

    if (value.length === 0) {
      // Show recent searches
      recentSearches.slice(0, 3).forEach((search) => {
        suggestions.push({
          type: 'recent',
          title: search.keywords || 'All Jobs',
          subtitle: search.location ? `${search.location} • Recent search` : 'Recent search',
          icon: <History />,
          filters: search,
        });
      });

      // Show popular job titles
      POPULAR_JOB_TITLES.slice(0, 3).forEach((title) => {
        suggestions.push({
          type: 'title',
          title,
          subtitle: 'Popular job title',
          icon: <Work />,
          filters: { keywords: title },
        });
      });

      return suggestions;
    }

    // Filter popular job titles based on input
    const matchingTitles = POPULAR_JOB_TITLES.filter(title =>
      title.toLowerCase().includes(value)
    ).slice(0, 3);

    matchingTitles.forEach((title) => {
      suggestions.push({
        type: 'title',
        title,
        subtitle: 'Popular job title',
        icon: <Work />,
        filters: { keywords: title },
      });
    });

    // Filter popular locations based on input
    const matchingLocations = POPULAR_LOCATIONS.filter(loc =>
      loc.toLowerCase().includes(value)
    ).slice(0, 2);

    matchingLocations.forEach((loc) => {
      suggestions.push({
        type: 'location',
        title: loc,
        subtitle: 'Popular location',
        icon: <LocationOn />,
        filters: { location: loc },
      });
    });

    // Show matching recent searches
    const matchingRecent = recentSearches.filter(search =>
      search.keywords?.toLowerCase().includes(value) ||
      search.location?.toLowerCase().includes(value)
    ).slice(0, 2);

    matchingRecent.forEach((search) => {
      suggestions.push({
        type: 'recent',
        title: search.keywords || 'All Jobs',
        subtitle: search.location ? `${search.location} • Recent search` : 'Recent search',
        icon: <History />,
        filters: search,
      });
    });

    return suggestions;
  }, [recentSearches]);

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    setKeywords(value);

    if (value.length > 0) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions(generateSuggestions(''));
      setShowSuggestions(true);
    }
  }, [generateSuggestions]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: SuggestionItem) => {
    setKeywords(suggestion.filters.keywords || '');
    setLocation(suggestion.filters.location || '');
    setInputValue(suggestion.filters.keywords || '');
    setShowSuggestions(false);

    const searchFilters: JobFilters = {
      ...suggestion.filters,
      keywords: suggestion.filters.keywords || keywords,
      location: suggestion.filters.location || location,
    };

    onSearch(searchFilters);
  }, [keywords, location, onSearch]);

  // Handle search submit
  const handleSearch = useCallback(() => {
    const filters: JobFilters = {
      keywords: keywords.trim(),
      location: location.trim(),
      limit: SEARCH_CONFIG.defaultLimit,
      offset: 0,
      includeAI: true,
      includeLI: true,
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof JobFilters];
      if (value === '' || value === undefined || value === null) {
        delete filters[key as keyof JobFilters];
      }
    });

    onSearch(filters);
    setShowSuggestions(false);
  }, [keywords, location, onSearch]);

  // Handle clear
  const handleClear = useCallback(() => {
    setKeywords('');
    setLocation('');
    setInputValue('');
    setShowSuggestions(false);
    keywordsRef.current?.focus();
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    } else if (event.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [handleSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize suggestions on mount
  useEffect(() => {
    setSuggestions(generateSuggestions(''));
  }, [generateSuggestions]);

  return (
    <Box ref={searchRef} className={className} sx={{ width: '100%', position: 'relative' }}>
      <Box display="flex" gap={1}>
        {/* Keywords/Title input */}
        <TextField
          ref={keywordsRef}
          fullWidth
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          autoFocus={autoFocus}
          size={size}
          variant={variant}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            endAdornment: inputValue && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear}>
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        {/* Location input */}
        {showLocation && (
          <TextField
            ref={locationRef}
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            size={size}
            variant={variant}
            sx={{ width: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={getCurrentLocation}>
                    <MyLocation />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        )}

        {/* Search button */}
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          startIcon={<Search />}
          sx={{
            px: 3,
            borderRadius: 2,
            minWidth: 120,
          }}
        >
          Search
        </Button>
      </Box>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            mt: 1,
            maxHeight: 320,
            overflow: 'auto',
            borderRadius: 2,
          }}
        >
          {suggestions.map((suggestion, index) => (
            <Box
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 2,
                cursor: 'pointer',
                borderBottom: index < suggestions.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
            >
              <Box sx={{ color: 'text.secondary', mr: 2 }}>
                {suggestion.icon}
              </Box>
              <Box flex={1}>
                <Typography variant="body2" fontWeight={500}>
                  {suggestion.title}
                </Typography>
                {suggestion.subtitle && (
                  <Typography variant="caption" color="text.secondary">
                    {suggestion.subtitle}
                  </Typography>
                )}
              </Box>
              {suggestion.type === 'recent' && (
                <Chip
                  label="Recent"
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
              {suggestion.type === 'popular' && (
                <Chip
                  label="Popular"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
            </Box>
          ))}
        </Paper>
      )}

      {/* Quick search chips */}
      {suggestions.length === 0 && !inputValue && (
        <Box
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            mt: 1,
            p: 2,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: theme.shadows[4],
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Popular searches:
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {['Software Engineer', 'Data Scientist', 'Product Manager', 'Remote'].map((term) => (
              <Chip
                key={term}
                label={term}
                size="small"
                variant="outlined"
                clickable
                onClick={() => {
                  if (term === 'Remote') {
                    setLocation('Remote');
                  } else {
                    setKeywords(term);
                    setInputValue(term);
                  }
                  handleSearch();
                }}
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;