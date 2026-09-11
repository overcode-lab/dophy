export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset?: string;
  apiKey?: string;
  apiSecret?: string;
  env?: string;
}

export function getCloudinaryConfig(): CloudinaryConfig {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    env: process.env.CLOUDINARY_ENV || "production",
  };
}

/**
 * Helper to slugify string for URL-safe Cloudinary folder names.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

/**
 * Builds an optimized Cloudinary image URL with transformation parameters.
 */
export function buildCloudinaryUrl(
  publicId: string,
  options?: { width?: number; height?: number; crop?: string; quality?: string }
) {
  const { cloudName } = getCloudinaryConfig();
  if (!cloudName) return publicId;

  const transformations: string[] = ["f_auto", "q_auto"];
  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.crop) transformations.push(`c_${options.crop}`);

  const transformString = transformations.join(",");
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
}

/**
 * Generic unsigned Cloudinary file uploader compatible with Client/Server/Edge.
 */
export async function uploadToCloudinary(
  file: File | Blob,
  folder = "dophy/production/general",
  customPublicId?: string
): Promise<{ url: string; public_id: string }> {
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary cloudName and uploadPreset must be configured in environment variables.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  if (customPublicId) {
    formData.append("public_id", customPublicId);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Cloudinary upload failed: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    public_id: data.public_id,
  };
}

/**
 * Specialized Cloudinary Uploader per Partner:
 * Generates path: dophy/{env}/partners/{referralCode}_{slugName}/{folderType}/
 */
export async function uploadPartnerAssetToCloudinary({
  file,
  referralCode,
  partnerName,
  folderType, // 'withdrawals' | 'sales-receipts'
  customFileName,
}: {
  file: File | Blob;
  referralCode: string;
  partnerName: string;
  folderType: "withdrawals" | "sales-receipts";
  customFileName?: string;
}): Promise<{ url: string; public_id: string }> {
  const { env } = getCloudinaryConfig();
  const partnerFolderSlug = `${referralCode}_${slugify(partnerName)}`;
  const folderPath = `dophy/${env || "production"}/partners/${partnerFolderSlug}/${folderType}`;

  return uploadToCloudinary(file, folderPath, customFileName);
}
