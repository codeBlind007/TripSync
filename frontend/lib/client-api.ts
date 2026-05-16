const PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function buildClientApiUrl(path: string) {
  const baseUrl = PUBLIC_BACKEND_URL?.replace(/\/$/, "");

  return baseUrl ? `${baseUrl}${path}` : path;
}
