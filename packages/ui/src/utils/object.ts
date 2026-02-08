export function get(object: Record<string, any>, path: string | string[], defaultValue?: any): any {
  if (typeof path === "string") path = path.split(".");

  let result: any = object;
  for (const key of path) {
    if (result === undefined || result === null) return defaultValue;
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
}
