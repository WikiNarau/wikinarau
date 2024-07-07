import { utime } from "../common/util";

export type PrivilegeLevel = "admin" | "moderator" | "user";

export interface DBUser {
	email: string;
	privilegeLevel: PrivilegeLevel;
	name: string;
	passwordHash: string;
	createdAt: number;
}

export class User {
	public readonly email: string;
	public readonly privilegeLevel: PrivilegeLevel;
	public name: string;
	private readonly passwordHash: string;
	public readonly createdAt: Date;

	static create(email: string, privilegeLevel: PrivilegeLevel): User {
		return new User({
			email,
			privilegeLevel,
			name: "",
			passwordHash: "",
			createdAt: utime(),
		});
	}

	constructor(data: DBUser) {
		this.email = data.email;
		this.privilegeLevel = data.privilegeLevel;
		this.name = data.name;
		this.passwordHash = data.passwordHash;
		this.createdAt = new Date(data.createdAt * 1000);
	}
}
