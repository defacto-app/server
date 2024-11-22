import mongoose from "mongoose";
import { connectDB } from "../../config/mongodb";
import AuthModel from "./model";
import moment from "moment";
import UserModel from "../user/model";


// Define special users
const specialUsers = [
	{
		email: `jaynette101@gmail.com`,
		joinedAt: new Date("2024-04-29"),
		lastSeenAt: new Date(),
		firstName: "Janet",
		provider: "email",
		role: "admin",
	},
	{
		email: `justice.nmegbu@gmail.com`,
		joinedAt: new Date("2024-04-29"),
		firstName: "Justice",
		provider: "email",
		lastSeenAt: new Date(),
		role: "admin",
	},
	{
		email: `appdeveloper.sky@gmail.com`,
		joinedAt: new Date("2024-04-29"),
		firstName: "zino",
		provider: "email",
		lastSeenAt: new Date(),
		role: "admin",
	},
	{
		email: `isaiahogbodo06@gmail.com`,
		joinedAt: new Date("2024-04-29"),
		lastSeenAt: new Date(),
		provider: "email",
		firstName: "izu",
		role: "user",
	},
	{
		email: `brianfury733@gmail.com`,
		joinedAt: new Date("2024-04-29"),
		lastSeenAt: new Date(),
		firstName: "briann",
		provider: "email",
		role: "user",
	},
	{
		email: `kats.com.ng@gmail.com`,
		joinedAt: new Date("2024-04-29"),
		firstName: "katalyst",
		provider: "email",
		lastSeenAt: new Date(),
		role: "admin",
	},
	{
		phoneNumber: "+2348063145125",
		joinedAt: new Date("2024-04-29"),
		firstName: "katalyst",
		provider: "phone",
		lastSeenAt: new Date(),
		role: "admin",
	},
];

async function seedUsers() {
	console.time("Seeding time");
	try {
		await connectDB();

		await AuthModel.deleteMany();
		await UserModel.deleteMany();

		const { auths, authError } = await generateAuth();
		if (authError) throw new Error(authError);

		const { users, usersError } = await generateUsers(auths);
		if (usersError) throw new Error(usersError);

		await AuthModel.insertMany(auths);
		await UserModel.insertMany(users);

		console.log(users);
	} catch (error) {
		console.error("Error seeding data:", error);
	} finally {
		await mongoose.disconnect();
		console.log("Database connection closed.");
		console.timeEnd("Seeding time");
	}
}

seedUsers().catch((error) => {
	console.error("Unhandled Error:", error);
	process.exit(1);
});

async function generateAuth() {
	const auths = [];

	try {
		const defaultPassword = await AuthModel.hashPassword("123456");

		for (let i = 0; i < specialUsers.length; i++) {
			const specialUser = specialUsers[i];
			const auth = new AuthModel({
				email: specialUser.email,
				role: specialUser.role,
				provider: specialUser.provider,
				phoneNumber:
					specialUser.provider === "phone"
						? specialUser.phoneNumber
						: undefined,
				password: defaultPassword,
				email_management: {
					verified: i === 0,
					login: {
						token: "457303",
						expires_at: moment().add(1, "day").toDate(),
						sent_at: moment().toDate(),
						confirmed_at: moment().toDate(),
					},
					reset: {},
				},
				phone_management: {
					verified: i === 0,
					login: {
						otp: "457303",
						sent_at: moment().toDate(),
						expires_at: moment().add(1, "day").toDate(),
						firstTime: i === 0,
					},
				},
				joinedAt: specialUser.joinedAt,
			});

			auths.push(auth);
		}

		return { auths, authError: null };
	} catch (e: any) {
		return { auths: null, authError: e.message };
	}
}

async function generateUsers(auths: any) {
	const users = [];

	try {
		for (let i = 0; i < auths.length; i++) {
			const auth = auths[i];
			const specialUser = specialUsers.find(
				(user) =>
					user.email === auth.email || user.phoneNumber === auth.phoneNumber,
			) as any;

			const user = new UserModel({
				email: auth.email,
				phoneNumber: auth.phoneNumber,
				role: auth.role,
				firstName: specialUser.firstName,
				joinedAt: auth.joinedAt,
				lastSeenAt: specialUser.lastSeenAt,
				userId: auth.publicId,
			});

			users.push(user);
		}

		return { users, usersError: null };
	} catch (e: any) {
		return { users: null, usersError: e.message };
	}
}
