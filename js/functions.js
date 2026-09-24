const checkLength = (string, maxLength) => string.length <= maxLength;
checkLength('abcdefghi', 10);

const isPalindrom = (string) => {
  const normalString = string.replaceAll(/\s/g, '').toLowerCase();
  const reversedString = normalString.split().reverse().join('');

  return normalString === reversedString;
};
isPalindrom('топот');

const getDigits = (string) => {
  const digits = string.toString().replaceAll(/\D/g, '');

  return digits === '' ? NaN : Number(digits);
};
getDigits('2023 год');
