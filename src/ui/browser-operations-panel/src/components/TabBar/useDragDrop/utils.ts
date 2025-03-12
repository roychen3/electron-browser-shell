export const moveItem = <T,>(arr: T[], itemIdx: number, toIdx: number) => {
  if (Array.isArray(arr) === false) return arr;
  if (Number.isInteger(itemIdx) === false) return arr;
  if (Number.isInteger(toIdx) === false) return arr;

  const startIdx = 0;
  const endIdx = arr.length - 1;
  const data = [...arr];
  const item = data.splice(itemIdx, 1)[0];

  if (itemIdx === 0 && itemIdx > toIdx) {
    data.splice(endIdx, 0, item);
    return data;
  } else if (itemIdx === endIdx && itemIdx < toIdx) {
    data.splice(startIdx, 0, item);
    return data;
  } else {
    data.splice(toIdx, 0, item);
    return data;
  }
};
