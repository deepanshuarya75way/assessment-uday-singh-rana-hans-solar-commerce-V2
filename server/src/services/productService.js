import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import {
  deleteProductImageFile,
  deleteProductMedia,
  persistUploadedImage,
  persistUploadedVideo,
} from '../utils/fileUpload.js';
import { toAbsoluteMediaUrl, normalizeStoredMediaUrl } from '../utils/mediaUrl.js';
import {
  isUploadedVideoUrl,
  isYouTubeVideoUrl,
  normalizeYouTubeVideoInput,
} from '../utils/videoUrl.js';
import { calculateGstPricing, normalizeGstFields } from '../utils/gst.js';
import {
  sanitizeProductDescription,
  stripDescriptionText,
} from '../utils/sanitizeProductDescription.js';
import { getMemoryCached } from '../utils/memoryCache.js';
import { CACHE_KEYS, invalidatePublicProducts } from '../utils/cacheKeys.js';

const findPublicIdForUrl = (url, images, publicIds = []) => {
  const normalized = normalizeStoredMediaUrl(url);
  const index = images.findIndex(
    (image) => normalizeStoredMediaUrl(image) === normalized,
  );

  return index >= 0 ? publicIds[index] ?? null : null;
};

const toAbsoluteMediaUrlForProduct = (mediaUrl, updatedAt, options = {}) =>
  toAbsoluteMediaUrl(mediaUrl, updatedAt, { width: 1200, ...options });

const formatProductVideoUrl = (videoUrl, updatedAt) => {
  if (!videoUrl) {
    return null;
  }

  if (isYouTubeVideoUrl(videoUrl)) {
    return videoUrl;
  }

  return toAbsoluteMediaUrlForProduct(videoUrl, updatedAt);
};

const normalizeSaleFields = (isOnSale, saleDiscountPercent) => {
  if (!isOnSale) {
    return { isOnSale: false, saleDiscountPercent: null };
  }

  const percent = Number(saleDiscountPercent);

  if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) {
    throw new ApiError(400, 'Sale discount must be between 1 and 99 percent');
  }

  return { isOnSale: true, saleDiscountPercent: percent };
};

const parseSpecifications = (value) => {
  if (!value) {
    return {};
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    throw new ApiError(400, 'Specifications must be valid JSON');
  }
};

const resolveProductVideoFields = async ({
  existingVideoUrl = null,
  existingVideoPublicId = null,
  videoFile = null,
  videoLink = null,
  removeVideo = false,
}) => {
  if (removeVideo) {
    if (existingVideoUrl && isUploadedVideoUrl(existingVideoUrl)) {
      await deleteProductMedia({
        videoUrl: existingVideoUrl,
        videoPublicId: existingVideoPublicId,
      });
    }

    return { videoUrl: null, videoPublicId: null };
  }

  if (videoFile) {
    if (existingVideoUrl && isUploadedVideoUrl(existingVideoUrl)) {
      await deleteProductMedia({
        videoUrl: existingVideoUrl,
        videoPublicId: existingVideoPublicId,
      });
    }

    const uploadedVideo = await persistUploadedVideo(videoFile);
    return {
      videoUrl: uploadedVideo.url,
      videoPublicId: uploadedVideo.publicId,
    };
  }

  if (videoLink !== undefined && videoLink !== null) {
    const trimmedLink = String(videoLink).trim();

    if (!trimmedLink) {
      if (existingVideoUrl && isUploadedVideoUrl(existingVideoUrl)) {
        await deleteProductMedia({
          videoUrl: existingVideoUrl,
          videoPublicId: existingVideoPublicId,
        });
      }

      return { videoUrl: null, videoPublicId: null };
    }

    const normalizedYouTube = normalizeYouTubeVideoInput(trimmedLink);

    if (!normalizedYouTube) {
      throw new ApiError(400, 'Enter a valid YouTube video link');
    }

    if (existingVideoUrl && isUploadedVideoUrl(existingVideoUrl)) {
      await deleteProductMedia({
        videoUrl: existingVideoUrl,
        videoPublicId: existingVideoPublicId,
      });
    }

    return { videoUrl: normalizedYouTube, videoPublicId: null };
  }

  return {
    videoUrl: existingVideoUrl,
    videoPublicId: existingVideoPublicId,
  };
};

const formatProduct = (product, { includeCategory = true } = {}) => {
  const gstPricing = calculateGstPricing(
    product.price,
    product.gstEnabled,
    product.gstPercentage,
  );

  const formatted = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    images: (product.images || []).map((image) =>
      toAbsoluteMediaUrlForProduct(image, product.updatedAt),
    ),
    videoUrl: formatProductVideoUrl(product.videoUrl, product.updatedAt),
    categoryId: product.categoryId,
    stock: product.stock,
    specifications: product.specifications || {},
    warranty: product.warranty,
    isActive: product.isActive,
    isTrending: product.isTrending,
    isGovernmentSubsidy: Boolean(
      product.isGovernmentSubsidy || product.isSubsidy,
    ),
    isSubsidy: Boolean(product.isSubsidy || product.isGovernmentSubsidy),
    subsidyDiscount: Number(product.subsidyDiscount) || 0,
    isOnSale: product.isOnSale ?? false,
    saleDiscountPercent: product.saleDiscountPercent ?? null,
    festivalId: product.festivalId ?? null,
    gstEnabled: gstPricing.gstEnabled,
    gstPercentage: gstPricing.gstPercentage,
    gstAmount: gstPricing.gstAmount,
    finalPrice: gstPricing.finalPrice,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };

  if (includeCategory && product.category) {
    formatted.category = {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    };
  }

  if (product.festival) {
    formatted.festival = {
      id: product.festival.id,
      name: product.festival.name,
      discountPercent: product.festival.discountPercent ?? null,
      isEnabled: Boolean(product.festival.isEnabled),
      startsAt: product.festival.startsAt ?? null,
      endsAt: product.festival.endsAt ?? null,
    };
  }

  if (product._count?.productViews !== undefined) {
    formatted.uniqueVisitorCount = product._count.productViews;
  }

  return formatted;
};

const formatProductSummary = (product, { includeCategory = true } = {}) => {
  const gstPricing = calculateGstPricing(
    product.price,
    product.gstEnabled,
    product.gstPercentage,
  );

  const formatted = {
    id: product.id,
    name: product.name,
    description: '', // Omitted from lists to reduce payload size significantly
    price: product.price,
    images: (product.images || []).map((image) =>
      toAbsoluteMediaUrlForProduct(image, product.updatedAt, { width: 600 }),
    ),
    videoUrl: null,
    categoryId: product.categoryId,
    stock: product.stock,
    specifications: product.specifications || {},
    warranty: product.warranty,
    isActive: product.isActive,
    isTrending: product.isTrending,
    isGovernmentSubsidy: Boolean(
      product.isGovernmentSubsidy || product.isSubsidy,
    ),
    isSubsidy: Boolean(product.isSubsidy || product.isGovernmentSubsidy),
    subsidyDiscount: Number(product.subsidyDiscount) || 0,
    isOnSale: product.isOnSale ?? false,
    saleDiscountPercent: product.saleDiscountPercent ?? null,
    festivalId: product.festivalId ?? null,
    gstEnabled: gstPricing.gstEnabled,
    gstPercentage: gstPricing.gstPercentage,
    gstAmount: gstPricing.gstAmount,
    finalPrice: gstPricing.finalPrice,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };

  if (includeCategory && product.category) {
    formatted.category = {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    };
  }

  if (product.festival) {
    formatted.festival = {
      id: product.festival.id,
      name: product.festival.name,
    };
  }

  return formatted;
};

const formatPublicProduct = (product) => formatProduct(product);

const formatPublicProductsSummary = (products) =>
  products.map((product) => formatProductSummary(product));

export const productInclude = {
  category: {
    select: { id: true, name: true, slug: true },
  },
  festival: {
    select: { id: true,
       name: true,
      discountPercent: true,
    isEnabled: true,
  startsAt: true,
endsAt:true,
 },
  },
};

const MAX_PUBLIC_PRODUCTS = 500;

export const productListSelect = {
  id: true,
  name: true,
  price: true,
  images: true,
  categoryId: true,
  stock: true,
  warranty: true,
  isActive: true,
  isTrending: true,
  isGovernmentSubsidy: true,
  isSubsidy: true,
  subsidyDiscount: true,
  isOnSale: true,
  saleDiscountPercent: true,
  gstEnabled: true,
  gstPercentage: true,
  festivalId: true,
  createdAt: true,
  updatedAt: true,
  category: productInclude.category,
  festival: productInclude.festival,
};

export const productDetailSelect = {
  ...productListSelect,
  description: true,
  videoUrl: true,
  specifications: true,
};

const relatedProductSelect = {
  ...productListSelect,
  specifications: true,
};

export { formatProduct, formatProductSummary };

export const searchPublicProducts = async ({ q, limit = 8 } = {}) => {
  const query = String(q || '').trim();
  if (!query) {
    return [];
  }

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const safeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const conditions = terms.map((term) => {
    const escaped = safeRegex(term);
    return {
      OR: [
        { name: { contains: escaped, mode: 'insensitive' } },
        { category: { name: { contains: escaped, mode: 'insensitive' } } },
        { category: { slug: { contains: escaped, mode: 'insensitive' } } },
        { warranty: { contains: escaped, mode: 'insensitive' } },
      ],
    };
  });

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      AND: conditions,
    },
    select: productListSelect,
    orderBy: [{ isTrending: 'desc' }, { updatedAt: 'desc' }],
    take: Math.min(Math.max(Number(limit) || 8, 1), 50),
  });

  return formatPublicProductsSummary(products);
};

export const getPublicProducts = async ({
  categorySlug,
  isSubsidy,
  search,
  limit,
  page,
} = {}) => {
  const where = { isActive: true };

  if (categorySlug) {
    where.category = { slug: categorySlug, isActive: true };
  }

  if (isSubsidy) {
    where.OR = [
      { isSubsidy: true },
      { isGovernmentSubsidy: true },
    ];
  }

  if (search) {
    const terms = String(search)
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    if (terms.length > 0) {
      const safeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const conditions = terms.map((term) => {
        const escaped = safeRegex(term);
        return {
          OR: [
            { name: { contains: escaped, mode: 'insensitive' } },
            { category: { name: { contains: escaped, mode: 'insensitive' } } },
            { category: { slug: { contains: escaped, mode: 'insensitive' } } },
          ],
        };
      });
      where.AND = conditions;
    }
  }

  const queryOptions = {
    where,
    select: productListSelect,
    orderBy: { createdAt: 'desc' },
  };

  const parsedLimit = Number(limit);
  const parsedPage = Number(page);
  if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
    queryOptions.take = Math.min(parsedLimit, MAX_PUBLIC_PRODUCTS);
    if (Number.isFinite(parsedPage) && parsedPage > 1) {
      queryOptions.skip = (parsedPage - 1) * queryOptions.take;
    }
  } else {
    queryOptions.take = MAX_PUBLIC_PRODUCTS;
  }

  const products = await prisma.product.findMany(queryOptions);

  return formatPublicProductsSummary(products);
};

export const getFeaturedProducts = async () => {
  return getMemoryCached(CACHE_KEYS.PUBLIC_FEATURED_PRODUCTS, 45_000, async () => {
    const baseWhere = { isActive: true };

    const [trendingProducts, subsidyProducts] = await Promise.all([
      prisma.product.findMany({
        where: { ...baseWhere, isTrending: true },
        select: productListSelect,
        orderBy: { updatedAt: 'desc' },
        take: 12,
      }),
      prisma.product.findMany({
        where: {
          ...baseWhere,
          OR: [{ isSubsidy: true }, { isGovernmentSubsidy: true }],
        },
        select: productListSelect,
        orderBy: { updatedAt: 'desc' },
        take: 12,
      }),
    ]);

    return {
      trendingProducts: formatPublicProductsSummary(trendingProducts),
      subsidyProducts: formatPublicProductsSummary(subsidyProducts),
    };
  });
};

export const getPublicProductById = async (id) => {
  return getMemoryCached(`${CACHE_KEYS.PUBLIC_PRODUCT}${id}`, 45_000, async () => {
    const product = await prisma.product.findFirst({
      where: { id, isActive: true },
      select: productDetailSelect,
    });

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const relatedProducts = await findRelatedProducts(product, id);

    return {
      product: formatPublicProduct(product),
      relatedProducts: formatPublicProductsSummary(relatedProducts),
    };
  });
};

const RELATED_PRODUCTS_LIMIT = 4;

const findRelatedProducts = async (product, excludeId) => {
  const selected = [];
  const excludedIds = new Set([excludeId]);

  const appendProducts = (products) => {
    for (const item of products) {
      if (selected.length >= RELATED_PRODUCTS_LIMIT) {
        break;
      }

      if (excludedIds.has(item.id)) {
        continue;
      }

      selected.push(item);
      excludedIds.add(item.id);
    }
  };

  const relatedOrderBy = [{ isTrending: 'desc' }, { updatedAt: 'desc' }];

  const [categoryProducts, supplementalProducts] = await Promise.all([
    product.categoryId
      ? prisma.product.findMany({
          where: {
            isActive: true,
            categoryId: product.categoryId,
            id: { not: excludeId },
          },
          select: relatedProductSelect,
          orderBy: relatedOrderBy,
          take: RELATED_PRODUCTS_LIMIT,
        })
      : Promise.resolve([]),
    prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: excludeId },
      },
      select: relatedProductSelect,
      orderBy: relatedOrderBy,
      take: RELATED_PRODUCTS_LIMIT,
    }),
  ]);

  appendProducts(categoryProducts);
  appendProducts(supplementalProducts);

  return selected;
};

export const getAdminProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return formatProduct(product);
};

export const getAdminProducts = async () => {
  const products = await prisma.product.findMany({
    include: {
      ...productInclude,
      _count: {
        select: { productViews: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return products.map((product) => formatProduct(product));
};

export const createProduct = async ({
  name,
  description,
  price,
  categoryId,
  stock = 0,
  specifications,
  warranty,
  isActive = true,
  isTrending = false,
  isGovernmentSubsidy = false,
  isSubsidy = false,
  subsidyDiscount = 0,
  isOnSale = false,
  saleDiscountPercent = null,
  gstEnabled = false,
  gstPercentage = 0,
  imageFiles = [],
  videoFile = null,
  videoLink = null,
}) => {
  if (!name?.trim()) {
    throw new ApiError(400, 'Product title is required');
  }

  if (!stripDescriptionText(description)) {
    throw new ApiError(400, 'Product description is required');
  }

  const sanitizedDescription = sanitizeProductDescription(description);

  if (!categoryId) {
    throw new ApiError(400, 'Product category is required');
  }

  if (!warranty?.trim()) {
    throw new ApiError(400, 'Product warranty is required');
  }

  if (imageFiles.length === 0) {
    throw new ApiError(400, 'At least one product image is required');
  }

  if (imageFiles.length > 5) {
    throw new ApiError(400, 'A maximum of 5 product images are allowed');
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw new ApiError(400, 'Selected category does not exist');
  }

  const uploadedImages = await Promise.all(
    imageFiles.map((file) => persistUploadedImage(file, 'products/images')),
  );
  const images = uploadedImages.map((upload) => upload.url);
  const imagePublicIds = uploadedImages.map((upload) => upload.publicId);
  const videoFields = await resolveProductVideoFields({
    videoFile,
    videoLink,
  });
  const saleFields = normalizeSaleFields(isOnSale, saleDiscountPercent);
  const gstFields = normalizeGstFields(gstEnabled, gstPercentage);

  const finalSubsidy = Boolean(isSubsidy || isGovernmentSubsidy);

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      description: sanitizedDescription,
      price: Number(price),
      discountPercent: 0,
      images,
      imagePublicIds,
      videoUrl: videoFields.videoUrl,
      videoPublicId: videoFields.videoPublicId,
      categoryId,
      stock: Number(stock) || 0,
      specifications: parseSpecifications(specifications),
      warranty: warranty.trim(),
      isActive,
      isTrending,
      isGovernmentSubsidy: finalSubsidy,
      isSubsidy: finalSubsidy,
      subsidyDiscount: finalSubsidy
        ? Math.max(0, Number(subsidyDiscount) || 0)
        : 0,
      ...saleFields,
      ...gstFields,
    },
    include: productInclude,
  });

  invalidatePublicProducts();

  return formatProduct(product);
};

export const updateProduct = async (
  id,
  {
    name,
    description,
    price,
    categoryId,
    stock,
    specifications,
    warranty,
    isActive,
    isTrending,
    isGovernmentSubsidy,
    isSubsidy,
    subsidyDiscount,
    isOnSale,
    saleDiscountPercent,
    gstEnabled,
    gstPercentage,
    existingImages = [],
    imageFiles = [],
    videoFile = null,
    videoLink,
    removeVideo = false,
  },
) => {
  const existingProduct = await prisma.product.findUnique({ where: { id } });

  if (!existingProduct) {
    throw new ApiError(404, 'Product not found');
  }

  let sanitizedDescription;
  if (description !== undefined) {
    if (!stripDescriptionText(description)) {
      throw new ApiError(400, 'Product description is required');
    }
    sanitizedDescription = sanitizeProductDescription(description);
  }

  const normalizedExistingImages = existingImages.map(normalizeStoredMediaUrl);
  const uploadedImages = await Promise.all(
    imageFiles.map((file) => persistUploadedImage(file, 'products/images')),
  );
  const mergedImages = [
    ...normalizedExistingImages,
    ...uploadedImages.map((upload) => upload.url),
  ];
  const mergedPublicIds = [
    ...normalizedExistingImages.map((url) =>
      findPublicIdForUrl(
        url,
        existingProduct.images,
        existingProduct.imagePublicIds ?? [],
      ),
    ),
    ...uploadedImages.map((upload) => upload.publicId),
  ];

  if (mergedImages.length === 0) {
    throw new ApiError(400, 'At least one product image is required');
  }

  if (mergedImages.length > 5) {
    throw new ApiError(400, 'A maximum of 5 product images are allowed');
  }

  const removedImages = existingProduct.images.filter(
    (image) => !mergedImages.includes(normalizeStoredMediaUrl(image)),
  );
  await Promise.all(
    removedImages.map((image) =>
      deleteProductImageFile(
        image,
        findPublicIdForUrl(
          image,
          existingProduct.images,
          existingProduct.imagePublicIds ?? [],
        ),
      ),
    ),
  );

  let videoUrl = existingProduct.videoUrl;
  let videoPublicId = existingProduct.videoPublicId;

  const resolvedVideo = await resolveProductVideoFields({
    existingVideoUrl: existingProduct.videoUrl,
    existingVideoPublicId: existingProduct.videoPublicId,
    videoFile,
    videoLink,
    removeVideo,
  });
  videoUrl = resolvedVideo.videoUrl;
  videoPublicId = resolvedVideo.videoPublicId;

  if (categoryId) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new ApiError(400, 'Selected category does not exist');
    }
  }

  const saleUpdate =
    isOnSale !== undefined
      ? normalizeSaleFields(
        isOnSale,
        saleDiscountPercent ?? existingProduct.saleDiscountPercent,
      )
      : {};

  const gstUpdate =
    gstEnabled !== undefined || gstPercentage !== undefined
      ? normalizeGstFields(
        gstEnabled ?? existingProduct.gstEnabled,
        gstEnabled === false
          ? 0
          : gstPercentage ?? existingProduct.gstPercentage,
      )
      : {};

  const resolvedSubsidy =
    isSubsidy !== undefined
      ? Boolean(isSubsidy)
      : isGovernmentSubsidy !== undefined
        ? Boolean(isGovernmentSubsidy)
        : undefined;

  const effectiveSubsidy =
    resolvedSubsidy !== undefined
      ? resolvedSubsidy
      : Boolean(existingProduct.isGovernmentSubsidy || existingProduct.isSubsidy);

  let subsidyDiscountUpdate = {};
  if (resolvedSubsidy === false) {
    subsidyDiscountUpdate = { subsidyDiscount: 0 };
  } else if (subsidyDiscount !== undefined) {
    subsidyDiscountUpdate = {
      subsidyDiscount: effectiveSubsidy
        ? Math.max(0, Number(subsidyDiscount) || 0)
        : 0,
    };
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: sanitizedDescription } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      discountPercent: 0,
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(stock !== undefined ? { stock: Number(stock) } : {}),
      ...(specifications !== undefined
        ? { specifications: parseSpecifications(specifications) }
        : {}),
      ...(warranty !== undefined ? { warranty: warranty.trim() } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(isTrending !== undefined ? { isTrending } : {}),
      ...(resolvedSubsidy !== undefined
        ? { isGovernmentSubsidy: resolvedSubsidy, isSubsidy: resolvedSubsidy }
        : {}),
      ...subsidyDiscountUpdate,
      ...saleUpdate,
      ...gstUpdate,
      images: mergedImages,
      imagePublicIds: mergedPublicIds,
      videoUrl,
      videoPublicId,
    },
    include: productInclude,
  });

  invalidatePublicProducts();

  return formatProduct(product);
};

export const deleteProduct = async (id) => {
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  await prisma.product.delete({ where: { id } });
  await deleteProductMedia({
    images: product.images,
    imagePublicIds: product.imagePublicIds ?? [],
    videoUrl: product.videoUrl,
    videoPublicId: product.videoPublicId,
  });

  invalidatePublicProducts();

  return { message: 'Product deleted successfully' };
};
