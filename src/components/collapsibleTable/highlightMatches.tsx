export const escapeRegExp = (string: string): string => {
  // Regular expression special characters are escaped
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the entire matched string
};

export const stripHtmlTags = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

export const highlightMatches = (text: string, searchText: string): string => {
  if (!text || !searchText) return text || '';

  // Ensure text is a string
  text = text.toString();

  // Escape special characters in searchText
  const escapedSearchText = escapeRegExp(searchText);

  // Create regex pattern to match the searchText, ignoring existing <mark> tags
  const regex = new RegExp(`(${escapedSearchText})(?![^<]*?>)(?![^<]*?<\\/mark>)`, 'gi');

  // Return text with <mark> tags for matched parts
  return text.replace(regex, (match) => 
    `<mark>${match}</mark>`
  );
};