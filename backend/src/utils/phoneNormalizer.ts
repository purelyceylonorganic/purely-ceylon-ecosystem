// =====================================================
// PHONE NUMBER NORMALIZER
// =====================================================

export const normalizePhoneNumber = (phone: string): string => {
  let normalized = String(phone).trim().replace(/\s+/g, "");

  // +94XXXXXXXXX → 94XXXXXXXXX
  if (normalized.startsWith("+94")) {
    normalized = normalized.substring(1);
  }

  // 0XXXXXXXXX → 94XXXXXXXXX
  else if (normalized.startsWith("0")) {
    normalized = "94" + normalized.substring(1);
  }

  // 94XXXXXXXXX → unchanged
  return normalized;
};