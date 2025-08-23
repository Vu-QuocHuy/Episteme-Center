/**
 * Helper function to create filter string with {} format
 * Example: createFilterString({ name: 'Nguyễn', email: 'test@example.com' })
 * Returns: "{name:Nguyễn,email:test@example.com}"
 */
export const createFilterString = (filters: Record<string, any>): string => {
  const filterEntries = Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}:${value}`)
    .join(',');

  return `{${filterEntries}}`;
};

/**
 * Helper function to create query params with filters
 * Example: createQueryParams({ page: 1, limit: 10, name: 'Nguyễn' })
 * Returns: { page: 1, limit: 10, filters: "{name:Nguyễn}" }
 */
export const createQueryParams = (params: Record<string, any>): Record<string, any> => {
  const { page, limit, name, email, ...otherParams } = params;

  const queryParams: Record<string, any> = {};

  if (page) queryParams.page = page;
  if (limit) queryParams.limit = limit;

  // Create filters object
  const filters: Record<string, any> = {};
  if (name) filters.name = name;
  if (email) filters.email = email;

  // Add other filter params
  Object.entries(otherParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      filters[key] = value;
    }
  });

  // Create filter string if there are filters
  if (Object.keys(filters).length > 0) {
    queryParams.filters = createFilterString(filters);
  }

  return queryParams;
};
