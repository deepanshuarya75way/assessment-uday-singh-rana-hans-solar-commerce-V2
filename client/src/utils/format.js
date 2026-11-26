export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const getDiscountedPrice = (price, discountPercent) =>
  Math.round(Number(price) * (1 - Number(discountPercent) / 100));

export const getNormalProductPricing = (product) => {
  if (product.isOnSale && product.saleDiscountPercent > 0) {
    return {
      originalPrice: product.price,
      salePrice: getDiscountedPrice(product.price, product.saleDiscountPercent),
      discountPercent: product.saleDiscountPercent,
      type: 'normal',
    };
  }

  return {
    originalPrice: product.price,
    salePrice: product.price,
    discountPercent: 0,
    type: null,
  };
};

export const isFestivalActive = (festival, now = new Date()) => {
  if (!festival || !festival.isEnabled) return false;
  const discount = Number(festival.discountPercent);
  if (!Number.isFinite(discount) || discount <= 0) return false;
  const start = festival.startsAt ? new Date(festival.startsAt) : null;
  const end = festival.endsAt ? new Date(festival.endsAt) : null;
  if(!start || !end  || Number.isNaN(start.getTime())|| Number.isNaN(end.getTime())){
    return false;
  }
  return now >= start && now <= end;
};

export const getEffectiveProductPricing = (product) => {
  const normalPricing = getNormalProductPricing(product);
  const normalDiscount = normalPricing.discountPercent || 0;
  const festivalActive = isFestivalActive (product?.festival);
  const festivalDiscount = festivalActive ?
  Number(product.festival.discountPercent): 0;

  if(festivalDiscount > 0 && festivalDiscount >= normalDiscount){
    return {
      originalPrice: product.price,
      salePrice: getDiscountedPrice(product.price,festivalDiscount),
      discountPercent: festivalDiscount,
      type: 'festival',
      promotionName: product.festival.name || 'festival offer' ,
    };
  }

  if (normalDiscount > 0){
    return{
      ...normalPricing,
      promotionName: 'regular sale',
    };
  }

  return{
    ...normalPricing,
    promotionName: null,
  };
};

export const getAmountSaved = (pricing) =>
  pricing.discountPercent > 0 ? pricing.originalPrice - pricing.salePrice : 0;

export const getProductGstDisplayPricing = (product) => {
  if (!product) {
    return {
      actualPrice: 0,
      normalDiscountAmount: 0,
      normalDiscountPercent: 0,
      priceAfterDiscount: 0,
      gstEnabled: false,
      gstPercentage: 0,
      gstAmount: 0,
      finalPrice: 0,
      hasNormalDiscount: false,
    };
  }

  const effectivePricing = getEffectiveProductPricing(product);
  const actualPrice = effectivePricing.originalPrice;
  const gstPricing = getGstPricing(
    actualPrice,
    product.gstEnabled,
    product.gstPercentage,
  );
  const priceWithGst = gstPricing.finalPrice;
  const hasNormalDiscount = effectivePricing.discountPercent > 0;
  const priceAfterDiscount = hasNormalDiscount
    ? getDiscountedPrice(priceWithGst, effectivePricing.discountPercent)
    : priceWithGst;
  const normalDiscountAmount = Math.max(0, priceWithGst - priceAfterDiscount);

  return {
    actualPrice,
    normalDiscountAmount: Math.round(normalDiscountAmount),
    normalDiscountPercent: effectivePricing.discountPercent,
    discountLabel: effectivePricing.promotionName || 'productDiscount',
    priceAfterDiscount: Math.round(priceAfterDiscount),
    gstEnabled: gstPricing.gstEnabled,
    gstPersentage: gstPricing.gstPercentage,
    gstAmount: Math.round(gstPricing.gstAmount),
    finalPrice: Math.round(priceAfterDiscount),
  };
};

export const getProductSubsidyPricing = (product) => {
  if (!product) {
    return {
      originalPrice: 0,
      normalDiscountAmount: 0,
      normalDiscountPercent: 0,
      priceAfterDiscount: 0,
      subsidyDiscount: 0,
      gstEnabled: false,
      gstPercentage: 0,
      gstAmount: 0,
      finalPrice: 0,
      totalSavings: 0,
      isSubsidy: false,
      hasSubsidyDiscount: false,
      hasNormalDiscount: false,
    };
  }

  const normalPricing = getNormalProductPricing(product);
  const isSubsidy = Boolean(product.isGovernmentSubsidy || product.isSubsidy);
  const rawSubsidy = Number(product.subsidyDiscount);
  const subsidyDiscount = isSubsidy && Number.isFinite(rawSubsidy)
    ? Math.max(0, rawSubsidy)
    : 0;

  const originalPrice = normalPricing.originalPrice;
  const gstPricing = getGstPricing(
    originalPrice,
    product.gstEnabled,
    product.gstPercentage,
  );
  const priceWithGst = gstPricing.finalPrice;
  const hasNormalDiscount = normalPricing.discountPercent > 0;
  const priceAfterDiscount = hasNormalDiscount
    ? getDiscountedPrice(priceWithGst, normalPricing.discountPercent)
    : priceWithGst;
  const normalDiscountAmount = Math.max(0, priceWithGst - priceAfterDiscount);
  const finalPrice = Math.max(0, priceAfterDiscount - subsidyDiscount);
  const totalSavings = normalDiscountAmount + subsidyDiscount;
  const hasSubsidyDiscount = isSubsidy && subsidyDiscount > 0;

  return {
    originalPrice,
    normalDiscountAmount: Math.round(normalDiscountAmount),
    normalDiscountPercent: normalPricing.discountPercent,
    priceAfterDiscount: Math.round(priceAfterDiscount),
    subsidyDiscount,
    gstEnabled: gstPricing.gstEnabled,
    gstPercentage: gstPricing.gstPercentage,
    gstAmount: Math.round(gstPricing.gstAmount),
    finalPrice: Math.round(finalPrice),
    totalSavings: Math.round(totalSavings),
    isSubsidy,
    hasSubsidyDiscount,
    hasNormalDiscount,
  };
};

export const getGstPricing = (basePrice, gstEnabled, gstPercentage) => {
  const price = Number(basePrice) || 0;
  const enabled = Boolean(gstEnabled);
  const percent =
    enabled && Number.isFinite(Number(gstPercentage))
      ? Number(gstPercentage)
      : 0;
  const gstAmount = enabled ? (price * percent) / 100 : 0;

  return {
    gstEnabled: enabled,
    gstPercentage: enabled ? percent : 0,
    gstAmount,
    finalPrice: price + gstAmount,
  };
};

export const stripMediaUrl = (url) => {
  if (!url) {
    return '';
  }

  if (url.startsWith('/uploads/')) {
    return url.split('?')[0];
  }

  if (url.includes('res.cloudinary.com')) {
    const cleanUrl = url.split('?')[0];
    return cleanUrl.replace(/\/upload\/(?:(?!v\d+\/)[^/]+\/)+/, '/upload/');
  }

  try {
    const parsed = new URL(url);
    return parsed.pathname.startsWith('/uploads/')
      ? parsed.pathname
      : `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split('?')[0];
  }
};
