import { JobFilters, ApiParams, ExperienceLevel, WorkArrangement, EmploymentType } from '@/types';

// Map of common location variations to full names
export const LOCATION_MAPPINGS: Record<string, string> = {
  'us': 'United States',
  'usa': 'United States',
  'uk': 'United Kingdom',
  'nyc': 'New York',
  'sf': 'San Francisco',
  'la': 'Los Angeles',
  'chi': 'Chicago',
  'dc': 'Washington DC',
  'atl': 'Atlanta',
  'boston': 'Boston',
  'seattle': 'Seattle',
  'austin': 'Austin',
  'denver': 'Denver',
  'miami': 'Miami',
  'phx': 'Phoenix',
  'philly': 'Philadelphia',
  'dallas': 'Dallas',
  'houston': 'Houston',
  'vegas': 'Las Vegas',
  'orlando': 'Orlando',
  'san diego': 'San Diego',
  'portland': 'Portland',
  'minneapolis': 'Minneapolis',
  'tampa': 'Tampa',
  'baltimore': 'Baltimore',
  'denver': 'Denver',
  'kansas city': 'Kansas City',
  'st louis': 'St. Louis',
  'sacramento': 'Sacramento',
  'cincinnati': 'Cincinnati',
  'cleveland': 'Cleveland',
  'pittsburgh': 'Pittsburgh',
  'columbus': 'Columbus',
  'charlotte': 'Charlotte',
  'indianapolis': 'Indianapolis',
  'milwaukee': 'Milwaukee',
  'oklahoma city': 'Oklahoma City',
  'raleigh': 'Raleigh',
  'nashville': 'Nashville',
  'virginia beach': 'Virginia Beach',
  'louisville': 'Louisville',
  'memphis': 'Memphis',
  'richmond': 'Richmond',
  'new orleans': 'New Orleans',
  'jacksonville': 'Jacksonville',
  'buffalo': 'Buffalo',
  'tucson': 'Tucson',
  'fresno': 'Fresno',
  'mesa': 'Mesa',
  'albuquerque': 'Albuquerque',
  'colorado springs': 'Colorado Springs',
  'omaha': 'Omaha',
  'long beach': 'Long Beach',
  'kansas': 'Kansas',
  'virginia': 'Virginia',
  'arizona': 'Arizona',
  'california': 'California',
  'texas': 'Texas',
  'florida': 'Florida',
  'georgia': 'Georgia',
  'carolina': 'North Carolina',
  'south carolina': 'South Carolina',
};

// Common job title keywords that should be preserved
export const JOB_TITLE_KEYWORDS = [
  'engineer', 'developer', 'manager', 'director', 'senior', 'lead', 'principal',
  'junior', 'sr', 'jr', 'associate', 'analyst', 'consultant', 'specialist',
  'coordinator', 'administrator', 'assistant', 'supervisor', 'head', 'chief',
  'vp', 'vice president', 'cto', 'ceo', 'cfo', 'coo', 'cmo', 'ciso',
  'architect', 'designer', 'product', 'project', 'program', 'portfolio',
  'business', 'technical', 'data', 'software', 'web', 'mobile', 'cloud',
  'devops', 'qa', 'quality', 'assurance', 'testing', 'automation',
  'cybersecurity', 'security', 'network', 'systems', 'infrastructure',
  'database', 'backend', 'frontend', 'full-stack', 'full stack',
  'machine learning', 'ml', 'ai', 'artificial intelligence', 'deep learning',
  'ux', 'ui', 'user experience', 'user interface', 'research',
  'marketing', 'sales', 'customer', 'client', 'account', 'relationship',
  'finance', 'accounting', 'financial', 'budget', 'cost', 'revenue',
  'human resources', 'hr', 'recruiting', 'talent', 'people', 'culture',
  'operations', 'supply chain', 'logistics', 'procurement', 'inventory',
  'compliance', 'legal', 'risk', 'audit', 'governance', 'regulatory',
  'healthcare', 'medical', 'clinical', 'nursing', 'pharmaceutical',
  'education', 'teaching', 'academic', 'research', 'student',
  'manufacturing', 'production', 'warehouse', 'factory', 'plant',
  'construction', 'civil', 'mechanical', 'electrical', 'structural',
  'retail', 'store', 'merchandise', 'visual', 'buyer', 'planner',
  'hospitality', 'hotel', 'restaurant', 'food', 'beverage', 'travel',
  'media', 'content', 'creative', 'writer', 'editor', 'journalist',
  'non-profit', 'charity', 'foundation', 'social impact', 'community',
];

// Clean and normalize location input
export const normalizeLocation = (location: string): string => {
  if (!location) return '';

  const cleaned = location.toLowerCase().trim();

  // Check for common mappings
  if (LOCATION_MAPPINGS[cleaned]) {
    return LOCATION_MAPPINGS[cleaned];
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(LOCATION_MAPPINGS)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return value;
    }
  }

  return location;
};

// Clean and normalize job title input
export const normalizeJobTitle = (title: string): string => {
  if (!title) return '';

  // Remove special characters but keep spaces
  let cleaned = title.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // Preserve important keywords
  const words = cleaned.split(' ');
  const preservedWords = words.filter(word =>
    JOB_TITLE_KEYWORDS.some(keyword => keyword.includes(word.toLowerCase()))
  );

  // If we have preserved words, prioritize them
  if (preservedWords.length > 0) {
    // Keep original order but ensure important keywords are included
    return words.map(word =>
      preservedWords.includes(word) ? word : word
    ).join(' ');
  }

  return cleaned;
};

// Validate employment type values
export const validateEmploymentType = (types: string[]): EmploymentType[] => {
  const validTypes: EmploymentType[] = [
    'FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY',
    'INTERN', 'VOLUNTEER', 'PER_DIEM', 'OTHER'
  ];

  return types.filter(type =>
    validTypes.includes(type.toUpperCase() as EmploymentType)
  ) as EmploymentType[];
};

// Validate work arrangement values
export const validateWorkArrangement = (arrangements: string[]): WorkArrangement[] => {
  const validArrangements: WorkArrangement[] = [
    'On-site', 'Hybrid', 'Remote OK', 'Remote Solely'
  ];

  return arrangements.filter(arrangement =>
    validArrangements.includes(arrangement)
  );
};

// Validate experience level values
export const validateExperienceLevel = (levels: string[]): ExperienceLevel[] => {
  const validLevels: ExperienceLevel[] = ['0-2', '2-5', '5-10', '10+'];

  return levels.filter(level => validLevels.includes(level));
};

// Build advanced search query with Boolean operators
export const buildAdvancedTitleQuery = (keywords: string): string => {
  if (!keywords) return '';

  const words = keywords.split(' ').filter(word => word.length > 1);

  if (words.length === 0) return keywords;
  if (words.length === 1) return words[0];

  // For multiple words, use AND operator for exact matching
  return words.map(word => word.includes(' ') ? `"${word}"` : word).join(' ');
};

// Build location query with OR operators for multiple locations
export const buildLocationQuery = (locations: string[]): string => {
  if (!locations || locations.length === 0) return '';
  if (locations.length === 1) return normalizeLocation(locations[0]);

  return locations
    .map(loc => normalizeLocation(loc))
    .filter(loc => loc.length > 0)
    .map(loc => `"${loc}"`)
    .join(' OR ');
};

// Validate and sanitize filters
export const validateFilters = (filters: JobFilters): JobFilters => {
  const validated: JobFilters = { ...filters };

  // Validate numeric values
  if (filters.limit !== undefined) {
    validated.limit = Math.min(Math.max(filters.limit, 1), 100); // API limits
  }

  if (filters.offset !== undefined) {
    validated.offset = Math.max(filters.offset, 0);
  }

  if (filters.salaryMin !== undefined) {
    validated.salaryMin = Math.max(filters.salaryMin, 0);
  }

  if (filters.salaryMax !== undefined) {
    validated.salaryMax = Math.max(filters.salaryMax, 0);
  }

  // Validate enum values
  if (filters.employmentType) {
    validated.employmentType = validateEmploymentType(filters.employmentType);
  }

  if (filters.workArrangement) {
    validated.workArrangement = validateWorkArrangement(filters.workArrangement);
  }

  if (filters.experienceLevel) {
    validated.experienceLevel = validateExperienceLevel(filters.experienceLevel);
  }

  // Validate sort options
  if (filters.sortBy && !['date', 'relevance', 'salary'].includes(filters.sortBy)) {
    delete validated.sortBy;
  }

  if (filters.sortOrder && !['asc', 'desc'].includes(filters.sortOrder)) {
    delete validated.sortOrder;
  }

  // Clean text inputs
  if (filters.keywords) {
    validated.keywords = normalizeJobTitle(filters.keywords);
  }

  if (filters.location) {
    validated.location = normalizeLocation(filters.location);
  }

  if (filters.organization) {
    validated.organization = filters.organization.trim();
  }

  if (filters.organizationExclusion) {
    validated.organizationExclusion = filters.organizationExclusion.trim();
  }

  return validated;
};

// Calculate API credit usage estimate
export const estimateApiCredits = (filters: JobFilters): number => {
  const limit = filters.limit || 20;
  const includeAI = filters.includeAI !== false;
  const includeLI = filters.includeLI !== false;

  // Base request credits: 1 per request
  let requestCredits = 1;

  // Job credits: limit per request
  let jobCredits = limit;

  // AI enrichment might require additional processing
  if (includeAI) {
    jobCredits = Math.ceil(jobCredits * 1.1); // 10% overhead for AI processing
  }

  // LinkedIn data might require additional processing
  if (includeLI) {
    jobCredits = Math.ceil(jobCredits * 1.05); // 5% overhead for LinkedIn data
  }

  return Math.max(requestCredits, jobCredits);
};

// Generate search hash for caching
export const generateSearchHash = (filters: JobFilters): string => {
  const sortedFilters = { ...filters };

  // Sort arrays for consistent hashing
  if (sortedFilters.employmentType) {
    sortedFilters.employmentType = [...sortedFilters.employmentType].sort();
  }

  if (sortedFilters.workArrangement) {
    sortedFilters.workArrangement = [...sortedFilters.workArrangement].sort();
  }

  if (sortedFilters.experienceLevel) {
    sortedFilters.experienceLevel = [...sortedFilters.experienceLevel].sort();
  }

  if (sortedFilters.categories) {
    sortedFilters.categories = [...sortedFilters.categories].sort();
  }

  return btoa(JSON.stringify(sortedFilters))
    .replace(/[+/=]/g, '')
    .substring(0, 16);
};