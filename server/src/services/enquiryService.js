import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';

const OPEN_ENQUIRY_STATUSES = ['NEW', 'CONTACTED', 'IN_PROGRESS'];

export const getEnquiryTypeFromSubject = (subject = '', type) => {
  if (type) {
    const lower = String(type).toLowerCase();
    if (lower === 'subsidy') return 'Subsidy';
    if (lower === 'distributor') return 'Distributor';
    if (lower === 'product') return 'Product';
    if (lower === 'quote') return 'Quote';
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  const s = (subject || '').toLowerCase();
  if (s.includes('subsidy')) {
    return 'Subsidy';
  }
  if (s.includes('distributor')) {
    return 'Distributor';
  }
  if (s.includes('product')) return 'Product';
  if (s.includes('quote') || s.includes('survey')) {
    return 'Quote';
  }
  return 'Contact';
};

export const getAdminEnquiries = async ({ limit } = {}) => {
  const parsedLimit =
    limit === undefined || limit === null || limit === ''
      ? undefined
      : Number.parseInt(String(limit), 10);

  const [enquiries, total, newCount, pendingCount] = await Promise.all([
    prisma.contactEnquiry.findMany({
      orderBy: { createdAt: 'desc' },
      ...(Number.isFinite(parsedLimit) && parsedLimit > 0
        ? { take: parsedLimit }
        : {}),
    }),
    prisma.contactEnquiry.count(),
    prisma.contactEnquiry.count({ where: { status: 'NEW' } }),
    prisma.contactEnquiry.count({
      where: { status: { in: OPEN_ENQUIRY_STATUSES } },
    }),
  ]);

  const formattedEnquiries = enquiries.map((enquiry) => ({
    ...enquiry,
    type: getEnquiryTypeFromSubject(enquiry.subject, enquiry.type),
  }));

  return {
    enquiries: formattedEnquiries,
    stats: {
      total,
      new: newCount,
      pending: pendingCount,
    },
  };
};

const buildEnquirySubject = (message) => {
  const trimmed = message.trim();

  if (!trimmed) {
    return 'Contact Us Enquiry';
  }

  if (trimmed.length <= 120) {
    return trimmed;
  }

  return `${trimmed.slice(0, 117)}...`;
};

const buildEnquirySubjectForPayload = ({
  message,
  enquiryType,
  productName,
  formSource,
}) => {
  const trimmedProductName = productName?.trim();
  const type = enquiryType || 'contact';

  if (type === 'subsidy') {
    return 'Subsidy Requirement';
  }

  if (type === 'product') {
    return trimmedProductName
      ? `Product Enquiry - ${trimmedProductName}`
      : 'Product Enquiry';
  }

  if (type === 'distributor') {
    return 'Distributor Enquiry';
  }

  if (type === 'quote' && formSource === 'siteSurvey') {
    return 'Free Site Survey';
  }

  if (type === 'quote') {
    return trimmedProductName
      ? `Quote Enquiry - ${trimmedProductName}`
      : 'Quote Enquiry';
  }

  if (type === 'contact') {
    return 'Contact Enquiry';
  }

  return buildEnquirySubject(message);
};

export const createContactEnquiry = async ({
  name,
  email,
  phone,
  message,
  enquiryType,
  type,
  subject,
  productName,
  formSource,
}) => {
  const trimmedMessage = message.trim();
  const resolvedType = enquiryType || type || 'contact';

  const resolvedSubject =
    (resolvedType === 'subsidy' ? 'Subsidy Requirement' : subject) ||
    buildEnquirySubjectForPayload({
      message: trimmedMessage,
      enquiryType: resolvedType,
      productName,
      formSource,
    });

  return prisma.contactEnquiry.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: resolvedSubject,
      message: trimmedMessage,
      status: 'NEW',
    },
  });
};

export const updateEnquiryStatus = async (id, status) => {
  try {
    return await prisma.contactEnquiry.update({
      where: { id },
      data: { status },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new ApiError(404, 'Enquiry not found');
    }

    throw error;
  }
};

export const deleteEnquiry = async (id) => {
  try {
    return await prisma.contactEnquiry.delete({
      where: { id },
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new ApiError(404, 'Enquiry not found');
    }

    throw error;
  }
};
