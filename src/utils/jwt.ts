import jwt, { JwtPayload } from "jsonwebtoken";

const secret = process.env.JWT_SECRET!;
/**
 * Generates a JWT token based on the given payload
 * @param {object} payload Payload to be included in the JWT token
 * @returns {string} The generated JWT token
 */

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, secret);
};

/**
 * Verifies the given JWT token using the secret stored in the environment
 * variable "JWT_SECRET"
 * @param {string} token The JWT token to be verified
 * @returns {JwtPayload} The payload of the verified JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};
