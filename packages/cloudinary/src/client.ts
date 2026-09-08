export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset?: string;
  apiKey?: string;
  apiSecret?: string;
}

export function getCloudinaryConfig(): CloudinaryConfig {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  };
}

/**
 * Builds an optimized Cloudinary image URL.
 */
export function buildCloudinaryUrl(publicId: string, options?: { width?: number; height?: number; crop?: string; quality?: string }) {
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
 * Directly uploads a file via client-side unsigned preset to Cloudinary REST API.
 * Compatible with Edge environments and Cloudflare Workers.
 */
export async function uploadToCloudinary(file: File, folder = "dophy-receipts"): Promise<{ url: string; public_id: string }> {
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary cloudName and uploadPreset must be configured in environment variables.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

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
