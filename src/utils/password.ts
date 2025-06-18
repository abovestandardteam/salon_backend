import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hashes a plaintext password.
 * @param password - Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(password, salt);
};

/**
 * Compares a plaintext password with its hashed version.
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from DB
 * @returns True if match, false otherwise
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
