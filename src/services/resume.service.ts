async function uploadResume(file: File) {
  console.log("Uploading:", file.name);

  return {
    success: true,
    message: "Resume uploaded successfully",
  };
}

export { uploadResume };