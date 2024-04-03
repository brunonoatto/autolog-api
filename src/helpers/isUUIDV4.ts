export const isUUIDV4 = (arr: string[], index: number) => {
  return arr.length >= index + 1
    ? arr[index].match(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
    : false;
};
