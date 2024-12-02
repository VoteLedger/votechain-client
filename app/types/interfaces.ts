export interface ApiResult<T> {
  data: T;
  error?: string;
}

// Specialized API response
