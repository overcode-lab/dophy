/**
 * Generates a clean, unique referral code for DOPHY Affiliates.
 * Format: DOPHY-[NAME_3_LETTERS][RANDOM_3_DIGITS] (e.g., DOPHY-BUD892)
 */
export function generateReferralCode(fullName: string): string {
  const cleanName = fullName
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, "X");

  const randomDigits = Math.floor(100 + Math.random() * 900); // 3 digits
  return `DOPHY-${cleanName}${randomDigits}`;
}
