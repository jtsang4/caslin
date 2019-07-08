export function isStringOrNonEmptyArray(value: any) {
  return ![].concat(value).some((item: any) => typeof item !== 'string');
}
