export const CREATOR_CODE_PREFIX = "DARI-";

export function generateReferralCode(fullName: string): string {
  const cleanName = fullName
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, "X");

  const randomDigits = Math.floor(100 + Math.random() * 900); // 3 digits
  return `${CREATOR_CODE_PREFIX}${cleanName}${randomDigits}`;
}

export function validateCreatorCode(code: string): { isValid: boolean; fullCode: string; error?: string } {
  if (!code || typeof code !== "string") {
    return { isValid: false, fullCode: "", error: "Creator Code wajib diisi" };
  }

  const normalized = code.trim().toUpperCase();

  if (!normalized.startsWith(CREATOR_CODE_PREFIX)) {
    return { isValid: false, fullCode: "", error: `Creator Code harus diawali dengan prefix '${CREATOR_CODE_PREFIX}'` };
  }

  const suffix = normalized.slice(CREATOR_CODE_PREFIX.length);

  if (suffix.length === 0) {
    return { isValid: false, fullCode: "", error: "Kode setelah 'DARI-' tidak boleh kosong" };
  }

  if (suffix.length > 15) {
    return { isValid: false, fullCode: "", error: "Kode setelah 'DARI-' maksimal 15 karakter" };
  }

  // Only alphanumeric (A-Z, 0-9)
  const alphanumericRegex = /^[A-Z0-9]+$/;
  if (!alphanumericRegex.test(suffix)) {
    return { isValid: false, fullCode: "", error: "Kode hanya boleh berisi huruf dan angka (alphanumeric)" };
  }

  return { isValid: true, fullCode: `${CREATOR_CODE_PREFIX}${suffix}` };
}
