import UserModel from "../../user/model";
import AuthModel from "../../auth/model";
import { v4 as uuidv4 } from "uuid";




interface CreateUserInput {
	email: string;
	phoneNumber: string;
	firstName: string;
	lastName?: string;
	role: "customer" | "admin" | "driver" | "manager" | "staff";
	password: string;
	address?: {
		street: string;
		city: string;
		state: string;
		country: string;
		postalCode: string;
	}[];
}

interface UserQueryParams {
	page: number;
	perPage: number;
	search: string;
	role?: string;
}


export class UserService {

static async getAllUsers({ page, perPage, search, role }: UserQueryParams) {
	// Build the search query
	const searchQuery: Record<string, any> = {};

	if (search) {
		searchQuery.$or = [
			{ firstName: { $regex: search, $options: "i" } },
			{ email: { $regex: search, $options: "i" } },
			{ phoneNumber: { $regex: search, $options: "i" } },
		];
	}

	if (role) {
		searchQuery.role = role; // Add role filter if provided
	}

	const sort = { createdAt: -1 }; // Default sorting by createdAt

	// Build the aggregation pipeline
	const aggregationPipeline = [
		{ $match: searchQuery },
		{ $sort: sort },
		{ $skip: (page - 1) * perPage },
		{ $limit: perPage },
	] as any;

	// Fetch the data and count the total documents
	const data = await UserModel.aggregate(aggregationPipeline);
	const total = await UserModel.countDocuments(searchQuery);

	return {
		data,
		meta: {
			totalPages: Math.ceil(total / perPage),
			page,
			perPage,
			total,
		},
	};
}

static async deleteUser(userId: string) {
		// Find and delete the user
		const user = await UserModel.findOneAndDelete({ userId });

		if (!user) {
			return { userDeleted: false, authDeleted: false };
		}

		// Find and delete the associated auth record
		const authDeletion = await AuthModel.findOneAndDelete({
			publicId: user.userId,
		});

		// Return the result
		return {
			userDeleted: true,
			authDeleted: !!authDeletion,
		};
	}

	static async createUser(userData: CreateUserInput) {
		// Generate a unique userId
		const userId = uuidv4();

		// First create the auth record
		const authRecord = await AuthModel.create({
			publicId: userId,
			email: userData.email,
			phoneNumber: userData.phoneNumber,
			password: await AuthModel.hashPassword(userData.password),
			role: userData.role,
			email_management: {
				verified: false // Requires email verification
			},
			phone_management: {
				verified: false // Requires phone verification
			}
		});

		// Then create the user record
		const user = await UserModel.create({
			userId: authRecord.publicId,
			email: userData.email,
			phoneNumber: userData.phoneNumber,
			firstName: userData.firstName,
			lastName: userData.lastName,
			role: userData.role,
			address: userData.address,
			joinedAt: new Date()
		});

		return { user, auth: authRecord };
	}



}
