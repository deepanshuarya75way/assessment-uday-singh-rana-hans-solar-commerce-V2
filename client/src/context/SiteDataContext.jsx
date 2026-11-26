import { createContext, useContext, useMemo } from 'react';
import { useGetPublicCategoriesQuery } from '@/services/categoriesApi';
import { useGetSiteMediaQuery } from '@/services/siteMediaApi';

const SiteDataContext = createContext(null);

export function SiteDataProvider({ children }) {
  const categoriesQuery = useGetPublicCategoriesQuery();
  const siteMediaQuery = useGetSiteMediaQuery();

  const value = useMemo(
    () => ({
      categoriesQuery,
      siteMediaQuery,
    }),
    [categoriesQuery, siteMediaQuery],
  );

  return (
    <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
  );
}

export function useSiteCategoriesQuery(options = {}) {
  const context = useContext(SiteDataContext);
  const fallbackQuery = useGetPublicCategoriesQuery(undefined, {
    ...options,
    skip: Boolean(context) || options.skip,
  });

  return context?.categoriesQuery ?? fallbackQuery;
}

export function useSiteMediaQuery(options = {}) {
  const context = useContext(SiteDataContext);
  const fallbackQuery = useGetSiteMediaQuery(undefined, {
    ...options,
    skip: Boolean(context) || options.skip,
  });

  return context?.siteMediaQuery ?? fallbackQuery;
}
