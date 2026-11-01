export function toUpperCaseENTR(str: string, lang: string): string {
  const lettersTR = { i: 'İ', ş: 'Ş', ğ: 'Ğ', ü: 'Ü', ö: 'Ö', ç: 'Ç', ı: 'I' };
  const lettersEN = { i: 'I', ş: 'S', ğ: 'G', ü: 'U', ö: 'O', ç: 'C', ı: 'I' };

  const letters = lang === 'EN' ? lettersEN : lettersTR;

  str = str.replace(/(([iışğüçö]))/g, letter => letters[letter]);
  return str.toUpperCase();
}
