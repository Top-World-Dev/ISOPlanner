import _ from "lodash";

export function areDifferent<T>(
  array1: T[] | undefined,
  array2: T[] | undefined,
  comparator: (a1: T, a2: T) => boolean
) {
  if (array1 === undefined && array2 === undefined) {
    return false;
  }
  if (array1 === undefined || array2 === undefined) {
    return true;
  }
  if (array1.length !== array2.length) {
    return true;
  }

  if (_.differenceWith<T, T>(array1, array2, comparator).length > 0) {
    return true;
  }
  if (_.differenceWith<T, T>(array2, array1, comparator).length > 0) {
    return true;
  }

  return false;
}
