import UserModel from "../../user/model";
import AuthModel from "../../auth/model";
import { v4 as uuidv4 } from "uuid";
import type { OrderDataType } from "../order/model";

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
// Define interfaces for better type safety
interface OrderSummary {
	orderId: string;
	createdAt: Date;
	status: string;
	type: string;
	description?: string;
	paymentStatus: string;
	totalAmount?: number;
}

interface DetailedUserResponse {
	// Basic user info
	userId: string;
	publicId: string;
	email: string;
	phoneNumber?: string;
	firstName: string;
	lastName?: string;
	role: "customer" | "admin" | "driver" | "manager" | "staff";
	lastSeenAt: Date | null;
	joinedAt: Date | null;

	// Account status
	accountStatus: {
		emailVerified: boolean;
		phoneVerified: boolean;
		lastSeen?: Date;
		isBanned: boolean;

		// joinedAt: Date;
	};

	// Optional fields based on role
	address?: any[];
	staffInfo?: {
		employeeId?: string;
		department?: string;
		status: "active" | "inactive" | "suspended";
		// joinedAt: Date;
		driverDetails?: {
			vehicleType?: string;
			licenseNumber?: string;
			availabilityStatus: "available" | "busy" | "offline";
		};
		managerDetails?: {
			managedRegion?: string;
			departmentType?: "operations" | "customer_service" | "logistics";
		};
	};
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
				verified: false, // Requires email verification
			},
			phone_management: {
				verified: false, // Requires phone verification
			},
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
		});

		return { user, auth: authRecord };
	}

	private static formatOrder(order: OrderDataType): OrderSummary {
		return {
			orderId: order.orderId,
			createdAt: order.createdAt,
			status: order.status,
			type: order.type,
			description: order.description,
			paymentStatus: order.paymentStatus,
			totalAmount: order.totalAmount,
		};
	}

	private static calculateOrderStats(orders: OrderDataType[]) {
		const stats = {
			total: orders.length,
			completed: 0,
			pending: 0,
			cancelled: 0,
			lastOrder: orders[0] ? UserService.formatOrder(orders[0]) : undefined,
		};

		for (const order of orders) {
			if (order.status === "completed") stats.completed++;
			else if (order.status === "pending") stats.pending++;
			else if (order.status === "cancelled") stats.cancelled++;
		}

		return stats;
	}

	static async getUser(userId: string): Promise<DetailedUserResponse | null> {
		try {
			// Validate userId
			if (!userId) {
				throw new Error("Invalid userId provided");
			}

			// Find user, auth details, and recent orders in parallel
			const [user, auth] = await Promise.all([
				UserModel.findOne({ userId }).lean(),
				AuthModel.findOne({ publicId: userId }).lean(),
			]);

			if (!user || !auth) {
				return null;
			}

			const detailedUser: DetailedUserResponse = {
				// Basic user info
				userId: user.userId,
				publicId: auth.publicId,
				email: user.email,
				phoneNumber: user.phoneNumber,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
				lastSeenAt: user.lastSeenAt,
				joinedAt: user.joinedAt,
				// createdAt: user.createdAt,

				// Account status
				accountStatus: {
					emailVerified: auth.email_management.verified,
					phoneVerified: auth.phone_management.verified || false,
					isBanned: auth.isBanned,
				},

				// Address if exists
				...(user.address ? { address: user.address } : {}),

				// Staff info for non-customer roles
				...(user.role !== "customer" && auth.staffInfo
					? {
							staffInfo: {
								employeeId: auth.staffInfo.employeeId,
								department: auth.staffInfo.department,
								status: auth.staffInfo.status,
								// joinedAt: auth.staffInfo.joinedAt,
								...(auth.staffInfo.driverDetails
									? {
											driverDetails: auth.staffInfo.driverDetails,
										}
									: {}),
								...(auth.staffInfo.managerDetails
									? {
											managerDetails: auth.staffInfo.managerDetails,
										}
									: {}),
							},
						}
					: {}),
			};

			return detailedUser;
		} catch (error) {
			console.error("Error fetching user details:", error);
			throw error;
		}
	}
}

export default UserService;
