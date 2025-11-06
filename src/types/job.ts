export interface LocationDerived {
  city: string;
  admin: string;
  country: string;
}

export interface LinkedInCompanyData {
  linkedin_org_employees?: number;
  linkedin_org_url?: string;
  linkedin_org_size?: string;
  linkedin_org_slogan?: string;
  linkedin_org_industry?: string;
  linkedin_org_followers?: number;
  linkedin_org_headquarters?: string;
  linkedin_org_type?: string;
  linkedin_org_foundeddate?: string;
  linkedin_org_specialties?: string[];
  linkedin_org_locations?: string[];
  linkedin_org_description?: string;
  linkedin_org_recruitment_agency_derived?: boolean;
  linkedin_org_slug?: string;
}

export interface Job {
  id: string;
  title: string;
  organization: string;
  organization_url: string;
  organization_logo: string;
  date_posted: string;
  date_created: string;
  date_validthrough?: string;
  locations_derived: LocationDerived[];
  locations_raw: any[];
  locations_alt_raw?: string[];
  employment_type: string[];
  url: string;
  source: string;
  source_type: string;
  source_domain: string;
  description_text?: string;
  description_html?: string;
  salary_raw?: any;
  remote_derived: boolean;
  domain_derived: string;
  location_type?: string;
  location_requirements_raw?: any[];

  // AI-enriched fields
  ai_salary_currency?: string;
  ai_salary_value?: number;
  ai_salary_minvalue?: number;
  ai_salary_maxvalue?: number;
  ai_salary_unit?: string;
  ai_benefits?: string[];
  ai_experience_level?: string;
  ai_work_arrangement?: string;
  ai_work_arrangement_office_days?: number;
  ai_remote_location?: string[];
  ai_remote_location_derived?: string[];
  ai_key_skills?: string[];
  ai_hiring_manager_name?: string;
  ai_hiring_manager_email_address?: string;
  ai_core_responsibilities?: string;
  ai_requirements_summary?: string;
  ai_working_hours?: number;
  ai_employment_type?: string[];
  ai_job_language?: string;
  ai_visa_sponsorship?: boolean;
  ai_taxonomies_a?: string[];
  ai_keywords?: string[];
  ai_education_requirements?: string[];
  ai_has_salary?: boolean;

  // LinkedIn company data
  linkedin_org_employees?: number;
  linkedin_org_url?: string;
  linkedin_org_size?: string;
  linkedin_org_slogan?: string;
  linkedin_org_industry?: string;
  linkedin_org_followers?: number;
  linkedin_org_headquarters?: string;
  linkedin_org_type?: string;
  linkedin_org_foundeddate?: string;
  linkedin_org_specialties?: string[];
  linkedin_org_locations?: string[];
  linkedin_org_description?: string;
  linkedin_org_recruitment_agency_derived?: boolean;
  linkedin_org_slug?: string;
}

export interface JobFilters {
  keywords?: string;
  location?: string;
  organization?: string;
  remote?: boolean;
  employmentType?: string[];
  experienceLevel?: string[];
  workArrangement?: string[];
  salaryMin?: number;
  salaryMax?: number;
  categories?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'relevance' | 'salary';
  sortOrder?: 'asc' | 'desc';
  dateFilter?: string;
  includeAI?: boolean;
  includeLI?: boolean;
  organizationExclusion?: string;
  industry?: string;
  visaSponsorship?: boolean;
  companySize?: string;
}

export interface UserProfile {
  name?: string;
  email?: string;
  resumeUrl?: string;
  preferredLocations: string[];
  preferredJobTypes: string[];
  preferredCategories: string[];
  experienceLevel?: string;
  workArrangement?: string[];
  salaryMin?: number;
  salaryMax?: number;
}

export interface SavedSearch {
  name: string;
  filters: JobFilters;
  createdAt: string;
}

export interface JobAlert {
  id: string;
  name: string;
  filters: JobFilters;
  frequency: 'daily' | 'weekly' | 'instant';
  enabled: boolean;
  createdAt: string;
}

export interface UserPreferences {
  savedJobs: string[];
  recentSearches: JobFilters[];
  savedSearches: SavedSearch[];
  jobAlerts: JobAlert[];
  profile: UserProfile;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    jobAlerts: boolean;
    applicationUpdates: boolean;
  };
}

export interface SearchState {
  currentFilters: JobFilters;
  searchResults: Job[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  recentSearches: JobFilters[];
  selectedJob: Job | null;
}

export interface ApiResponse<T> {
  data: T[];
  count: number;
  hasMore: boolean;
  error?: string;
}

export interface ApiParams {
  limit?: number;
  offset?: number;
  title_filter?: string;
  location_filter?: string;
  organization_filter?: string;
  organization_exclusion_filter?: string;
  description_filter?: string;
  description_type?: 'text' | 'html';
  remote?: boolean;
  include_ai?: boolean;
  include_li?: boolean;
  ai_employment_type_filter?: string;
  ai_work_arrangement_filter?: string;
  ai_taxonomies_a_filter?: string;
  ai_has_salary?: boolean;
  ai_experience_level_filter?: string;
  ai_visa_sponsorship_filter?: boolean;
  li_industry_filter?: string;
  li_organization_slug_filter?: string;
  li_organization_slug_exclusion_filter?: string;
  date_filter?: string;
}

// Job card variant types
export type JobCardVariant = 'default' | 'compact' | 'featured';

// Work arrangement types
export type WorkArrangement = 'On-site' | 'Hybrid' | 'Remote OK' | 'Remote Solely';

// Employment types
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'TEMPORARY' | 'INTERN' | 'VOLUNTEER' | 'PER_DIEM' | 'OTHER';

// Experience levels
export type ExperienceLevel = '0-2' | '2-5' | '5-10' | '10+';

// Taxonomy categories
export type TaxonomyCategory =
  | 'Technology'
  | 'Healthcare'
  | 'Management & Leadership'
  | 'Finance & Accounting'
  | 'Human Resources'
  | 'Sales'
  | 'Marketing'
  | 'Customer Service & Support'
  | 'Education'
  | 'Legal'
  | 'Engineering'
  | 'Science & Research'
  | 'Trades'
  | 'Construction'
  | 'Manufacturing'
  | 'Logistics'
  | 'Creative & Media'
  | 'Hospitality'
  | 'Environmental & Sustainability'
  | 'Retail'
  | 'Data & Analytics'
  | 'Software'
  | 'Energy'
  | 'Agriculture'
  | 'Social Services'
  | 'Administrative'
  | 'Government & Public Sector'
  | 'Art & Design'
  | 'Food & Beverage'
  | 'Transportation'
  | 'Consulting'
  | 'Sports & Recreation'
  | 'Security & Safety';