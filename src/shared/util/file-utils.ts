/**
 * Convert file to Base64 string.
 * This function was provided file to Base64 string
 * the file is an empty then return null.
 *
 * @param file Object.
 * @param cb Callback function.
 */
export const toBase64 = (file: File, cb: (v: string) => void) => {
  const fileReader: FileReader = new FileReader();
  fileReader.readAsDataURL(file);
  fileReader.onload = e => {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const result = e.target.result.toString();
    const base64Data = result.substring(result.indexOf('base64,') + 'base64,'.length);
    cb(base64Data);
  };
};

/**
 * Convert Base64 to File.
 * This function was provided Base64 string to file conversions.
 * the file is an empty then return null.
 *
 * @param base64String base64 file value.
 * @param contentType file content type.
 * @param filename File name.
 */
export const toFile = (base64String: string, fileType: string, fileName: string): File => {
  const bstr = atob(base64String);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: fileType });
};
