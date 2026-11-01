export interface CustomError {
  status: number;
  data: Record<string, string[]>; // This is a dictionary of string arrays in the form of { fieldName: [errorMessage] }
}
