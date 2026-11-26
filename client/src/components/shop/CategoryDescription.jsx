import { sanitizeDescriptionHtml } from '@/utils/productDescription';

export default function CategoryDescription({ description, className = '' }) {
  if (!description) {
    return null;
  }

  const sanitized = sanitizeDescriptionHtml(description);
  if (!sanitized) {
    return null;
  }

  return (
    <div
      className={`category-description break-words ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
