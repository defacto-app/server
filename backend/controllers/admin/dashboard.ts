import type { Request, Response } from "express";

import AuthModel from "../../auth/model";
import SendResponse from "../../libs/response-helper";
import RestaurantModel from "../../restaurant/model";
import OrderModel from "../../admin/order/model";
import MenuModel from "../../menu/model";

const Dashboard = {
	async all_users(req: Request, res: Response): Promise<void> {
		try {
			const users = await AuthModel.find({});

			res.status(200).json(users);
		} catch (e) {
			res.status(500).json({
				error: e,
			});
		}
	},

	async summary(req: Request, res: Response): Promise<void> {
		console.time('DataFetchTime'); // Start timing before fetching starts
		try {
			// USERS
			const users = await AuthModel.countDocuments({});
			const newUsersLastWeek = await AuthModel.countDocuments({
				joinedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
			});
			const activeUsers = await AuthModel.countDocuments({
				lastSeenAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
			});
			const verifiedUsers = await AuthModel.countDocuments({
				"email_management.verified": true,
			});
			const unverifiedUsers = users - verifiedUsers;
			const userRoles = await AuthModel.aggregate([
				{ $group: { _id: "$role", count: { $sum: 1 } } },
			]);
			const bannedUsers = await AuthModel.countDocuments({
				banned_until: { $ne: null },
			});

			// RESTAURANTS
			const totalRestaurants = await RestaurantModel.countDocuments({});
			const restaurantsWithMenus = await RestaurantModel.countDocuments({
				menuItems: { $exists: true, $not: { $size: 0 } },
			});
			const popularCategory = await RestaurantModel.aggregate([
				{ $group: { _id: "$category", count: { $sum: 1 } } },
				{ $sort: { count: -1 } },
				{ $limit: 1 },
			]);
			const highestMenuCount = await RestaurantModel.aggregate([
				{ $project: { menuItemsCount: { $size: "$menuItems" }, name: 1 } },
				{ $sort: { menuItemsCount: -1 } },
				{ $limit: 1 },
			]);
			const averageMenuCount = restaurantsWithMenus
				? await RestaurantModel.aggregate([
					{
						$project: { menuItemsCount: { $size: "$menuItems" } },
					},
					{
						$group: {
							_id: null,
							avgMenuItems: { $avg: "$menuItemsCount" },
						},
					},
				])
				: [];

			// ORDERS
			const totalOrders = await OrderModel.countDocuments({});
			const ordersByType = await OrderModel.aggregate([
				{ $group: { _id: "$type", count: { $sum: 1 } } },
			]);
			const avgOrderValue = await OrderModel.aggregate([
				{ $group: { _id: null, avgValue: { $avg: "$charge" } } },
			]);
			const ordersByStatus = await OrderModel.aggregate([
				{ $group: { _id: "$status", count: { $sum: 1 } } },
			]);
			const instantOrders = await OrderModel.countDocuments({ isInstant: true });
			const pendingOrdersOlderThan48Hours = await OrderModel.countDocuments({
				status: "pending",
				createdAt: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
			});
			const totalRevenue = await OrderModel.aggregate([
				{ $match: { status: "completed" } },
				{ $group: { _id: null, totalRevenue: { $sum: "$charge" } } },
			]);

			// MENU
			const totalMenuItems = await MenuModel.countDocuments({});
			const availableMenuItems = await MenuModel.countDocuments({
				available: true,
			});
			const unavailableMenuItems = totalMenuItems - availableMenuItems;
			const avgMenuPrice = await MenuModel.aggregate([
				{ $group: { _id: null, avgPrice: { $avg: "$price" } } },
			]);
			const popularMenuCategory = await MenuModel.aggregate([
				{ $group: { _id: "$category", count: { $sum: 1 } } },
				{ $sort: { count: -1 } },
				{ $limit: 1 },
			]);

			// TIMESTAMP
			const timestamp = new Date().toLocaleString("en-US", {
				timeZone: "UTC",
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "numeric",
				minute: "numeric",
				second: "numeric",
			});

			const summary = {
				users: {
					total: users,
					newLastWeek: newUsersLastWeek,
					activeLastMonth: activeUsers,
					verified: verifiedUsers,
					unverified: unverifiedUsers,
					roles: userRoles,
					banned: bannedUsers,
				},
				restaurants: {
					total: totalRestaurants,
					withMenus: restaurantsWithMenus,
					popularCategory: popularCategory.length
						? popularCategory[0]._id
						: "N/A",
					highestMenuCount: highestMenuCount.length
						? highestMenuCount[0]
						: "N/A",
					averageMenuCount: averageMenuCount.length
						? averageMenuCount[0].avgMenuItems
						: 0,
				},
				orders: {
					total: totalOrders,
					byType: ordersByType,
					avgValue: avgOrderValue.length ? avgOrderValue[0].avgValue : 0,
					byStatus: ordersByStatus,
					instantOrders,
					pendingOlderThan48Hours: pendingOrdersOlderThan48Hours,
					totalRevenue: totalRevenue.length
						? totalRevenue[0].totalRevenue
						: 0,
				},
				menu: {
					total: totalMenuItems,
					available: availableMenuItems,
					unavailable: unavailableMenuItems,
					avgPrice: avgMenuPrice.length ? avgMenuPrice[0].avgPrice : 0,
					popularCategory: popularMenuCategory.length
						? popularMenuCategory[0]._id
						: "N/A",
				},
				timestamp,
			};

			console.timeEnd('DataFetchTime');
			SendResponse.success(res, "Dashboard Summary", summary);
		} catch (e: any) {
			SendResponse.serverError(res, e.message);
		}
	}



};

export default Dashboard;
