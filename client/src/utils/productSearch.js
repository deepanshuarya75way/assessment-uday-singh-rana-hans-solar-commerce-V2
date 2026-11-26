const normalizeWhitespace = (value) =>
  String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

export const normalizeSearchQuery = (value) =>
  normalizeWhitespace(value).replace(/-/g, ' ');

const getSearchTerms = (query) =>
  normalizeSearchQuery(query)
    .split(' ')
    .filter(Boolean);

const stemTerm = (term) => {
  if (term.length > 3 && term.endsWith('s')) {
    return term.slice(0, -1);
  }

  return term;
};

export const getProductSearchText = (product) => {
  const specifications =
    product.specifications && typeof product.specifications === 'object'
      ? product.specifications
      : {};

  const specificationEntries = Object.entries(specifications);

  return [
    product.name,
    product.description,
    product.category?.name,
    product.category?.slug?.replace(/-/g, ' '),
    product.warranty,
    ...specificationEntries.flatMap(([key, value]) => [key, value]),
  ]
    .filter(Boolean)
    .map((entry) => String(entry).toLowerCase())
    .join(' ');
};

const termMatchesHaystack = (term, haystack) => {
  if (!term) {
    return true;
  }

  if (haystack.includes(term)) {
    return true;
  }

  const stemmedTerm = stemTerm(term);

  if (stemmedTerm !== term && haystack.includes(stemmedTerm)) {
    return true;
  }

  if (term.length < 3) {
    return false;
  }

  return haystack
    .split(/[\s,/|]+/)
    .filter(Boolean)
    .some((word) => {
      const stemmedWord = stemTerm(word);

      return (
        word.startsWith(stemmedTerm) ||
        stemmedWord.startsWith(stemmedTerm) ||
        word.includes(stemmedTerm)
      );
    });
};

export const matchesProductSearch = (product, query) => {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return true;
  }

  const haystack = getProductSearchText(product);

  if (haystack.includes(normalizedQuery)) {
    return true;
  }

  const terms = getSearchTerms(normalizedQuery);

  return terms.every((term) => termMatchesHaystack(term, haystack));
};

export const filterProductsBySearch = (products, query) => {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return products;
  }

  const seen = new Set();

  return products.filter((product) => {
    if (!product?.id || seen.has(product.id)) {
      return false;
    }

    if (!matchesProductSearch(product, normalizedQuery)) {
      return false;
    }

    seen.add(product.id);
    return true;
  });
};

const getNavbarSearchWords = (product) => {
  const parts = [
    product.name,
    product.category?.name,
    product.category?.slug?.replace(/-/g, ' '),
  ].filter(Boolean);

  return parts.flatMap((part) =>
    String(part)
      .toLowerCase()
      .split(/[\s,/|+-]+/)
      .filter(Boolean),
  );
};

export const matchesNavbarSearchSuggestion = (product, query) => {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return false;
  }

  if (normalizedQuery.length === 1) {
    return getNavbarSearchWords(product).some((word) =>
      word.startsWith(normalizedQuery),
    );
  }

  if (normalizedQuery.length === 2) {
    const haystack = getProductSearchText(product);

    if (haystack.includes(normalizedQuery)) {
      return true;
    }

    return getNavbarSearchWords(product).some((word) =>
      word.startsWith(normalizedQuery),
    );
  }

  return matchesProductSearch(product, normalizedQuery);
};

export const filterNavbarSearchSuggestions = (products, query, limit = 8) => {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  const seen = new Set();

  return products
    .filter((product) => product?.isActive !== false)
    .filter((product) => {
      if (!product?.id || seen.has(product.id)) {
        return false;
      }

      if (!matchesNavbarSearchSuggestion(product, normalizedQuery)) {
        return false;
      }

      seen.add(product.id);
      return true;
    })
    .slice(0, limit);
};
