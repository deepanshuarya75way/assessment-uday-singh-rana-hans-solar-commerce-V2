import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '@/admin/store/adminAuthSlice';

const API_BASE_URL =
  (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '') ||
  (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '');

const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);
const MAX_RETRIES = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().adminAuth?.token;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

const isAdminSessionExpired = (error) =>
  error?.status === 401 &&
  typeof error?.data?.message === 'string' &&
  error.data.message.includes('Admin session expired');

const getRetryDelayMs = (error, attempt) => {
  if (error?.status === 429) {
    const retryAfterHeader = error?.meta?.response?.headers?.get?.('Retry-After');
    const retryAfterSeconds = Number(retryAfterHeader);
    if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
      return retryAfterSeconds * 1000;
    }
  }

  return Math.min(1000 * 2 ** attempt, 8000);
};

const baseQueryWithAdminSessionHandling = async (args, api, extraOptions) => {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (isAdminSessionExpired(result.error)) {
      api.dispatch(logout());

      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/admin/login')
      ) {
        window.location.replace('/admin/login');
      }

      return result;
    }

    if (
      !result.error ||
      !RETRYABLE_STATUSES.has(result.error.status) ||
      attempt >= MAX_RETRIES - 1
    ) {
      return result;
    }

    await sleep(getRetryDelayMs(result.error, attempt));
    attempt += 1;
  }

  return rawBaseQuery(args, api, extraOptions);
};

export const api = createApi({
  reducerPath: 'api',
  keepUnusedDataFor: 120,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  baseQuery: baseQueryWithAdminSessionHandling,
  tagTypes: [
    'Auth',
    'Products',
    'Categories',
    'Cart',
    'Orders',
    'Users',
    'Reviews',
    'Wishlist',
    'Payments',
    'Admin',
    'HomepageBanner',
    'Festival',
    'SiteMedia',
    'Enquiries',
    'Analytics',
  ],
  endpoints: () => ({}),
});
