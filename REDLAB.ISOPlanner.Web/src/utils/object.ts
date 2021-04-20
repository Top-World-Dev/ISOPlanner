import _ from "lodash";

export function deepClone<T>(obj: T): T {
   return _.cloneDeep<T>(obj);
}