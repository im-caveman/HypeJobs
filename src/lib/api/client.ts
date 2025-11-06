import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { Job, JobFilters, ApiParams, ApiResponse } from '@/types';

// API configuration
const API_CONFIG = {
  baseURL: 'https://active-jobs-db.p.rapidapi.com',
  headers: {
    'x-rapidapi-host': 'active-jobs-db.p.rapidapi.com',
    'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
  },
  timeout: 10000, // 10 seconds timeout
};

// Create axios instance
const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Request interceptor for logging and rate limiting
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and rate limiting
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log rate limiting headers for monitoring
    const rateLimitHeaders = {
      jobsRemaining: response.headers['x-ratelimit-jobs-remaining'],
      requestsRemaining: response.headers['x-ratelimit-requests-remaining'],
      jobsLimit: response.headers['x-ratelimit-jobs-limit'],
      requestsLimit: response.headers['x-ratelimit-requests-limit'],
      reset: response.headers['x-ratelimit-jobs-reset'],
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('Rate Limit Headers:', rateLimitHeaders);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle rate limiting
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      const retryAfter = error.response.headers['retry-after'];
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // Default to 1 minute

      console.log(`Rate limited. Retrying after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));

      return apiClient(originalRequest);
    }

    // Handle service unavailable
    if (error.response?.status === 503) {
      throw new Error('Job service temporarily unavailable. Please try again later.');
    }

    // Handle unauthorized (invalid API key)
    if (error.response?.status === 401) {
      throw new Error('Invalid API key. Please check your configuration.');
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    throw new Error(errorMessage);
  }
);

// Map frontend filters to API parameters
export const buildApiParams = (filters: JobFilters): ApiParams => {
  const params: ApiParams = {
    limit: filters.limit || 20,
    offset: filters.offset || 0,
    include_ai: filters.includeAI !== false, // Default to true
    include_li: filters.includeLI !== false, // Default to true
    description_type: 'text',
  };

  // Search filters
  if (filters.keywords) {
    params.title_filter = filters.keywords;
  }

  if (filters.location) {
    params.location_filter = filters.location;
  }

  if (filters.organization) {
    params.organization_filter = filters.organization;
  }

  if (filters.organizationExclusion) {
    params.organization_exclusion_filter = filters.organizationExclusion;
  }

  // Remote work filter
  if (filters.remote !== undefined) {
    params.remote = filters.remote;
  }

  // AI-powered filters
  if (filters.employmentType && filters.employmentType.length > 0) {
    params.ai_employment_type_filter = filters.employmentType.join(',');
  }

  if (filters.workArrangement && filters.workArrangement.length > 0) {
    params.ai_work_arrangement_filter = filters.workArrangement.join(',');
  }

  if (filters.experienceLevel && filters.experienceLevel.length > 0) {
    params.ai_experience_level_filter = filters.experienceLevel.join(',');
  }

  if (filters.categories && filters.categories.length > 0) {
    params.ai_taxonomies_a_filter = filters.categories.join(',');
  }

  // Salary filter
  if (filters.salaryMin || filters.salaryMax) {
    params.ai_has_salary = true;
  }

  // Industry filter (LinkedIn)
  if (filters.industry) {
    params.li_industry_filter = filters.industry;
  }

  // Visa sponsorship
  if (filters.visaSponsorship) {
    params.ai_visa_sponsorship_filter = true;
  }

  // Date filter
  if (filters.dateFilter) {
    params.date_filter = filters.dateFilter;
  }

  return params;
};

// API service functions
export const jobsApi = {
  // Get jobs with filters
  getJobs: async (filters: JobFilters = {}): Promise<ApiResponse<Job>> => {
    try {
      const params = buildApiParams(filters);
      const response = await apiClient.get('/active-ats-24h', { params });

      const jobs: Job[] = response.data;
      const totalCount = parseInt(response.headers['x-total-count'] || jobs.length.toString());
      const hasMore = jobs.length === (filters.limit || 20);

      return {
        data: jobs,
        count: totalCount,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  // Get single job by ID (Note: API doesn't have single job endpoint, so we'll search by job ID)
  getJobById: async (jobId: string): Promise<Job | null> => {
    try {
      // Since the API doesn't provide a single job endpoint,
      // we'll need to search and filter by job ID
      // This is a limitation we'll need to work around
      const params: ApiParams = {
        limit: 100,
        include_ai: true,
        include_li: true,
        description_type: 'text',
      };

      const response = await apiClient.get('/active-ats-24h', { params });
      const jobs: Job[] = response.data;

      const job = jobs.find(j => j.id === jobId);
      return job || null;
    } catch (error) {
      console.error('Error fetching job by ID:', error);
      throw error;
    }
  },

  // Get similar jobs based on current job
  getSimilarJobs: async (job: Job, limit: number = 10): Promise<Job[]> => {
    try {
      const filters: JobFilters = {
        keywords: job.title.split(' ').slice(0, 2).join(' '), // Use first 2 words of title
        location: job.locations_derived[0]?.country,
        categories: job.ai_taxonomies_a?.slice(0, 3), // Use first 3 categories
        limit,
        includeAI: true,
        includeLI: true,
      };

      const params = buildApiParams(filters);
      const response = await apiClient.get('/active-ats-24h', { params });
      const similarJobs: Job[] = response.data;

      // Filter out the current job
      return similarJobs.filter(j => j.id !== job.id).slice(0, limit);
    } catch (error) {
      console.error('Error fetching similar jobs:', error);
      throw error;
    }
  },

  // Get jobs by company
  getJobsByCompany: async (organization: string, limit: number = 20): Promise<Job[]> => {
    try {
      const params: ApiParams = {
        organization_filter: organization,
        limit,
        include_ai: true,
        include_li: true,
        description_type: 'text',
      };

      const response = await apiClient.get('/active-ats-24h', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs by company:', error);
      throw error;
    }
  },

  // Get jobs by location
  getJobsByLocation: async (location: string, limit: number = 20): Promise<Job[]> => {
    try {
      const params: ApiParams = {
        location_filter: location,
        limit,
        include_ai: true,
        include_li: true,
        description_type: 'text',
      };

      const response = await apiClient.get('/active-ats-24h', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs by location:', error);
      throw error;
    }
  },

  // Get featured jobs (recent jobs with AI enrichment)
  getFeaturedJobs: async (limit: number = 10): Promise<Job[]> => {
    try {
      const params: ApiParams = {
        limit,
        include_ai: true,
        include_li: true,
        description_type: 'text',
        ai_has_salary: true, // Only get jobs with salary information
      };

      const response = await apiClient.get('/active-ats-24h', { params });
      const jobs: Job[] = response.data;

      // Sort by AI salary value (highest first) and date posted
      return jobs
        .filter(job => job.ai_salary_value)
        .sort((a, b) => {
          const salaryA = a.ai_salary_value || 0;
          const salaryB = b.ai_salary_value || 0;
          return salaryB - salaryA;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
      throw error;
    }
  },
};

// Export the API client for advanced usage
export { apiClient };

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Rate limiting utility
export class RateLimitError extends ApiError {
  constructor(message: string, public retryAfter?: number) {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
  }
}

// Service unavailable error
export class ServiceUnavailableError extends ApiError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 'SERVICE_UNAVAILABLE', 503);
    this.name = 'ServiceUnavailableError';
  }
}