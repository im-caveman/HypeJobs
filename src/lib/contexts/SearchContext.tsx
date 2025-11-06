'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Job, JobFilters, SearchState } from '@/types';
import { jobsApi } from '@/lib/api';
import { recentSearchesStorage } from '@/lib/utils/storage';
import { SEARCH_CONFIG } from '@/lib/config';

// Action types
type SearchAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: JobFilters }
  | { type: 'UPDATE_FILTERS'; payload: Partial<JobFilters> }
  | { type: 'SET_RESULTS'; payload: { jobs: Job[]; totalCount: number; hasMore: boolean } }
  | { type: 'APPEND_RESULTS'; payload: { jobs: Job[]; hasMore: boolean } }
  | { type: 'SET_SELECTED_JOB'; payload: Job | null }
  | { type: 'RESET_SEARCH' }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'CLEAR_RESULTS' }
  | { type: 'SET_TOTAL_COUNT'; payload: number }
  | { type: 'ADD_RECENT_SEARCH'; payload: JobFilters };

// Initial state
const initialState: SearchState = {
  currentFilters: {
    limit: SEARCH_CONFIG.defaultLimit,
    offset: 0,
    includeAI: true,
    includeLI: true,
  },
  searchResults: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  recentSearches: [],
  selectedJob: null,
};

// Search reducer
const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error, // Clear error when loading starts
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'SET_FILTERS':
      return {
        ...state,
        currentFilters: action.payload,
        currentPage: 1,
      };

    case 'UPDATE_FILTERS':
      return {
        ...state,
        currentFilters: {
          ...state.currentFilters,
          ...action.payload,
        },
        currentPage: 1,
      };

    case 'SET_RESULTS':
      return {
        ...state,
        searchResults: action.payload.jobs,
        totalCount: action.payload.totalCount,
        hasMore: action.payload.hasMore,
        loading: false,
        error: null,
      };

    case 'APPEND_RESULTS':
      return {
        ...state,
        searchResults: [...state.searchResults, ...action.payload.jobs],
        hasMore: action.payload.hasMore,
        loading: false,
      };

    case 'SET_SELECTED_JOB':
      return {
        ...state,
        selectedJob: action.payload,
      };

    case 'RESET_SEARCH':
      return {
        ...initialState,
        recentSearches: state.recentSearches, // Preserve recent searches
      };

    case 'SET_PAGE':
      return {
        ...state,
        currentPage: action.payload,
        currentFilters: {
          ...state.currentFilters,
          offset: (action.payload - 1) * (state.currentFilters.limit || SEARCH_CONFIG.defaultLimit),
        },
      };

    case 'CLEAR_RESULTS':
      return {
        ...state,
        searchResults: [],
        totalCount: 0,
        currentPage: 1,
        currentFilters: {
          ...state.currentFilters,
          offset: 0,
        },
      };

    case 'SET_TOTAL_COUNT':
      return {
        ...state,
        totalCount: action.payload,
      };

    case 'ADD_RECENT_SEARCH':
      return {
        ...state,
        recentSearches: [action.payload, ...state.recentSearches]
          .slice(0, SEARCH_CONFIG.recentSearchesLimit),
      };

    default:
      return state;
  }
};

// Search context
interface SearchContextType {
  state: SearchState;
  // Actions
  searchJobs: (filters?: JobFilters) => Promise<void>;
  loadMoreJobs: () => Promise<void>;
  updateFilters: (filters: Partial<JobFilters>) => void;
  setFilters: (filters: JobFilters) => void;
  resetSearch: () => void;
  setSelectedJob: (job: Job | null) => void;
  setPage: (page: number) => void;
  clearResults: () => void;
  retrySearch: () => Promise<void>;
  // Getters
  hasResults: boolean;
  hasError: boolean;
  canLoadMore: boolean;
  currentPageJobs: Job[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Search provider component
interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(searchReducer, initialState);

  // Load recent searches from storage on mount
  useEffect(() => {
    const recentSearches = recentSearchesStorage.getRecentSearches();
    if (recentSearches.length > 0) {
      dispatch({ type: 'SET_RESULTS', payload: { jobs: [], totalCount: 0, hasMore: false } });
      // Update state with recent searches (this would be handled by the reducer)
    }
  }, []);

  // Search jobs function
  const searchJobs = async (filters?: JobFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const searchFilters = filters || state.currentFilters;
      const response = await jobsApi.getJobs(searchFilters);

      dispatch({
        type: 'SET_RESULTS',
        payload: {
          jobs: response.data,
          totalCount: response.count,
          hasMore: response.hasMore,
        },
      });

      // Save to recent searches if it's a new search
      if (filters && Object.keys(filters).length > 2) { // More than just limit/offset
        recentSearchesStorage.addRecentSearch(filters);
        dispatch({ type: 'ADD_RECENT_SEARCH', payload: filters });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Search error:', error);
    }
  };

  // Load more jobs function
  const loadMoreJobs = async () => {
    if (state.loading || !state.hasMore) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const nextPage = state.currentPage + 1;
      const updatedFilters = {
        ...state.currentFilters,
        offset: (nextPage - 1) * (state.currentFilters.limit || SEARCH_CONFIG.defaultLimit),
      };

      const response = await jobsApi.getJobs(updatedFilters);

      dispatch({
        type: 'APPEND_RESULTS',
        payload: {
          jobs: response.data,
          hasMore: response.hasMore,
        },
      });

      dispatch({ type: 'SET_PAGE', payload: nextPage });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load more jobs';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Load more error:', error);
    }
  };

  // Update filters function
  const updateFilters = (filters: Partial<JobFilters>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  };

  // Set filters function
  const setFilters = (filters: JobFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  // Reset search function
  const resetSearch = () => {
    dispatch({ type: 'RESET_SEARCH' });
  };

  // Set selected job function
  const setSelectedJob = (job: Job | null) => {
    dispatch({ type: 'SET_SELECTED_JOB', payload: job });
  };

  // Set page function
  const setPage = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  // Clear results function
  const clearResults = () => {
    dispatch({ type: 'CLEAR_RESULTS' });
  };

  // Retry search function
  const retrySearch = async () => {
    await searchJobs(state.currentFilters);
  };

  // Computed values
  const hasResults = state.searchResults.length > 0;
  const hasError = state.error !== null;
  const canLoadMore = state.hasMore && !state.loading;
  const currentPageJobs = state.searchResults;

  const contextValue: SearchContextType = {
    state,
    searchJobs,
    loadMoreJobs,
    updateFilters,
    setFilters,
    resetSearch,
    setSelectedJob,
    setPage,
    clearResults,
    retrySearch,
    hasResults,
    hasError,
    canLoadMore,
    currentPageJobs,
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

// Hook to use search context
export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

// Hook to get current filters
export const useSearchFilters = () => {
  const { state, updateFilters, setFilters } = useSearch();
  return {
    filters: state.currentFilters,
    updateFilters,
    setFilters,
  };
};

// Hook to get search results
export const useSearchResults = () => {
  const { state, searchJobs, loadMoreJobs, retrySearch } = useSearch();
  return {
    jobs: state.searchResults,
    loading: state.loading,
    error: state.error,
    totalCount: state.totalCount,
    hasMore: state.hasMore,
    searchJobs,
    loadMoreJobs,
    retrySearch,
  };
};

// Hook to get selected job
export const useSelectedJob = () => {
  const { state, setSelectedJob } = useSearch();
  return {
    selectedJob: state.selectedJob,
    setSelectedJob,
  };
};

// Hook to get recent searches
export const useRecentSearches = () => {
  const { state, searchJobs } = useSearch();

  const applyRecentSearch = (filters: JobFilters) => {
    setFilters(filters);
    searchJobs(filters);
  };

  return {
    recentSearches: state.recentSearches,
    applyRecentSearch,
  };
};

export default SearchContext;