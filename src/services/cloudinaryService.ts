interface CloudinaryUploadOptions {
  uri: string;
  folder: string;
  fileName: string;
}

export async function uploadImageToCloudinary({
  uri,
  folder,
  fileName,
}: CloudinaryUploadOptions): Promise<string> {
  const data = new FormData();

  data.append("file", {
    uri,
    type: "image/jpeg",
    name: fileName,
  } as any);

  data.append("upload_preset", "profile_uploads");
  data.append("folder", folder);

  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: data,
    }
  );

  const json = await res.json();

  if (!json.secure_url) {
    throw new Error("Cloudinary upload failed");
  }

  return json.secure_url as string;
}

// Convenience wrapper for profile image uploads
export async function uploadProfileImageToCloudinary(
  uri: string
): Promise<string> {
  return uploadImageToCloudinary({
    uri,
    folder: "users",
    fileName: "profile.jpg",
  });
}

// Convenience wrapper for post image uploads
export async function uploadPostImageToCloudinary(
  uri: string
): Promise<string> {
  return uploadImageToCloudinary({
    uri,
    folder: "posts",
    fileName: "post.jpg",
  });
}
