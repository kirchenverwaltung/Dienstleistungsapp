export async function UploadFile(file) {
  if (!file) {
    return { file_url: "https://example.com/placeholder.png" };
  }
  const name = file.name || "upload";
  return { file_url: `https://files.example.com/${encodeURIComponent(name)}` };
}
