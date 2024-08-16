import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

export const hashPasswordSync = (password: string) => {
	const salt = randomBytes(16).toString("hex");
	const buf = scryptSync(password, salt, 64) as Buffer;
	return `sc.${buf.toString("hex")}.${salt}`;
};

export const comparePasswordSync = (
	suppliedPassword: string,
	storedPassword: string,
): boolean => {
	// split() returns array
	const [_, hashedPassword, salt] = storedPassword.split(".");
	// we need to pass buffer values to timingSafeEqual
	const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
	// we hash the new sign-in password
	const suppliedPasswordBuf = scryptSync(suppliedPassword, salt, 64);
	// compare the new supplied password with the stored hashed password
	return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
};
