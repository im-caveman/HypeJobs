// Application configuration
export const APP_CONFIG = {
  name: 'HypeJobs',
  description: 'Smart Job Aggregator with AI-powered recommendations',
  version: '1.0.0',
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  environment: process.env.NODE_ENV || 'development',
};

// API configuration
export const API_CONFIG = {
  rapidApiKey: process.env.RAPIDAPI_KEY || '',
  baseURL: 'https://active-jobs-db.p.rapidapi.com',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Search configuration
export const SEARCH_CONFIG = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultOffset: 0,
  featuredJobsLimit: 10,
  similarJobsLimit: 5,
  recentSearchesLimit: 10,
  debounceDelay: 300, // milliseconds for search input debouncing
};

// Cache configuration
export const CACHE_CONFIG = {
  jobListingsTTL: 15 * 60 * 1000, // 15 minutes
  jobDetailsTTL: 60 * 60 * 1000, // 1 hour
  companyDataTTL: 24 * 60 * 60 * 1000, // 24 hours
  searchResultsTTL: 10 * 60 * 1000, // 10 minutes
  maxCacheSize: 100, // Maximum number of cached items
};

// Storage configuration
export const STORAGE_CONFIG = {
  prefix: 'hypejobs_',
  keys: {
    savedJobs: 'saved_jobs',
    recentSearches: 'recent_searches',
    savedSearches: 'saved_searches',
    jobAlerts: 'job_alerts',
    userProfile: 'user_profile',
    preferences: 'preferences',
  },
  maxSize: 5 * 1024 * 1024, // 5MB total storage limit
};

// UI configuration
export const UI_CONFIG = {
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
  },
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  animation: {
    duration: {
      short: 150,
      medium: 300,
      long: 500,
    },
    easing: 'ease-in-out',
  },
};

// Feature flags
export const FEATURES = {
  aiRecommendations: true,
  linkedinIntegration: true,
  jobAlerts: true,
  savedJobs: true,
  advancedFilters: true,
  salaryInsights: true,
  companyInsights: true,
  similarJobs: true,
  mobileApp: false, // Future feature
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 30,
  maxJobsPerHour: 1000,
  rateLimitWarningThreshold: 0.8, // Warn when 80% of limit is reached
  rateLimitRetryDelay: 60000, // 1 minute
};

// Error messages
export const ERROR_MESSAGES = {
  networkError: 'Network error. Please check your connection and try again.',
  rateLimitExceeded: 'API rate limit exceeded. Please wait before making more requests.',
  serviceUnavailable: 'Job service temporarily unavailable. Please try again later.',
  invalidApiKey: 'Invalid API configuration. Please contact support.',
  noResultsFound: 'No jobs found matching your criteria. Try adjusting your filters.',
  invalidFilters: 'Invalid search filters. Please check your input and try again.',
  localStorageError: 'Unable to save data locally. Your browser may be in private mode.',
  geolocationError: 'Unable to get your location. Please enter it manually.',
  shareError: 'Unable to share job. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  jobSaved: 'Job saved successfully!',
  jobRemoved: 'Job removed from saved jobs.',
  searchSaved: 'Search saved successfully!',
  alertCreated: 'Job alert created successfully!',
  profileUpdated: 'Profile updated successfully!',
  preferencesSaved: 'Preferences saved successfully!',
};

// Popular locations for suggestions
export const POPULAR_LOCATIONS = [
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'France',
  'Australia',
  'Netherlands',
  'New York',
  'San Francisco',
  'London',
  'Toronto',
  'Berlin',
  'Sydney',
  'Amsterdam',
  'Remote',
];

// Popular job categories
export const POPULAR_CATEGORIES = [
  'Technology',
  'Software',
  'Data & Analytics',
  'Engineering',
  'Healthcare',
  'Finance & Accounting',
  'Marketing',
  'Sales',
  'Human Resources',
  'Customer Service & Support',
  'Management & Leadership',
  'Creative & Media',
  'Education',
  'Legal',
  'Logistics',
];

// Popular job titles for auto-complete
export const POPULAR_JOB_TITLES = [
  'Software Engineer',
  'Data Scientist',
  'Product Manager',
  'UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'Business Analyst',
  'Project Manager',
  'DevOps Engineer',
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Machine Learning Engineer',
  'Data Analyst',
  'Product Designer',
  'Account Manager',
  'Operations Manager',
  'Financial Analyst',
  'HR Manager',
  'Customer Success Manager',
];

// Employment types
export const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACTOR', label: 'Contract' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'INTERN', label: 'Internship' },
  { value: 'PER_DIEM', label: 'Per Diem' },
  { value: 'VOLUNTEER', label: 'Volunteer' },
  { value: 'OTHER', label: 'Other' },
];

// Work arrangements
export const WORK_ARRANGEMENTS = [
  { value: 'On-site', label: 'On-site' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'Remote OK', label: 'Remote OK' },
  { value: 'Remote Solely', label: 'Fully Remote' },
];

// Experience levels
export const EXPERIENCE_LEVELS = [
  { value: '0-2', label: 'Entry Level (0-2 years)' },
  { value: '2-5', label: 'Mid Level (2-5 years)' },
  { value: '5-10', label: 'Senior Level (5-10 years)' },
  { value: '10+', label: 'Executive Level (10+ years)' },
];

// Alert frequencies
export const ALERT_FREQUENCIES = [
  { value: 'instant', label: 'Instant' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

// Sort options
export const SORT_OPTIONS = [
  { value: 'date', label: 'Most Recent' },
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'salary', label: 'Highest Salary' },
];

// Export all configurations
export default {
  APP_CONFIG,
  API_CONFIG,
  SEARCH_CONFIG,
  CACHE_CONFIG,
  STORAGE_CONFIG,
  UI_CONFIG,
  FEATURES,
  RATE_LIMIT_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  POPULAR_LOCATIONS,
  POPULAR_CATEGORIES,
  POPULAR_JOB_TITLES,
  EMPLOYMENT_TYPES,
  WORK_ARRANGEMENTS,
  EXPERIENCE_LEVELS,
  ALERT_FREQUENCIES,
  SORT_OPTIONS,
};