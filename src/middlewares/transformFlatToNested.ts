import { Request, Response, NextFunction } from "express";

export const transformFlatToNested = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const transformedBody: any = {};

  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split(/[\[\]\.]+/).filter(Boolean);
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      const isNextArray = !isNaN(Number(keys[i + 1]));

      if (!current[key]) {
        current[key] = isNextArray ? [] : {};
      }

      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  };

  for (const [key, value] of Object.entries(req.body)) {
    setNestedValue(transformedBody, key, value);
  }

  req.body = transformedBody;
  next();
};
