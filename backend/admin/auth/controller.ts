import type { Request, Response } from "express";

import AuthValidator from "../../auth/validator";

import AuthModel from "../../auth/model";
import SendResponse from "../../libs/response-helper";

import { generateToken } from "../../services/jwt.service";
import EmailEvent from "../../events/email.event";
import { generateOTP } from "../../utils/utils";

const AdminAuthController = {
	async admin_login(req: Request, res: Response): Promise<void> {
		try {
			const { data, error } = await AuthValidator.admin_login(req.body);

			if (error) {
				SendResponse.badRequest(res, "", error);
				return;
			}

			// check if user exists by email and role only
			const user = await AuthModel.findOne({
				email: data?.email,
				role: "admin",
			});

			if (!user || !user.email_management?.login) {
				SendResponse.notFound(res, "Admin not found");
				return;
			}

			// Now check if the OTP matches
			if (user.email_management.login.token !== data?.otp) {
				SendResponse.badRequest(res, "Invalid OTP", {
					otp: "Invalid OTP",
				});
				return;
			}

			// Check if OTP is still valid
			const currentTime = new Date();
			const otpExpiryTime = new Date(
				user.email_management?.login.expires_at || Date.now(),
			);

			if (currentTime > otpExpiryTime) {
				SendResponse.badRequest(res, "OTP has expired", {
					otp: "OTP has expired",
				});
				return;
			}

			const token = generateToken(user);

			SendResponse.success(res, "Admin logged in", { token });
		} catch (e: any) {
			SendResponse.serverError(res, e.message);
		}
	},
	async send_otp(req: Request, res: Response): Promise<void> {
		const { data, error } = await AuthValidator.email_address(req.body);
		const otp = generateOTP();

		if (error) {
			SendResponse.badRequest(res, "Invalid email address", error);

			return;
		}

		// check if user exists
		const userExists = await AuthModel.findOne({ email: data?.email });

		if (!userExists) {
			SendResponse.notFound(res, "Email is not registered");
			return;
		}

		// update the user with the new OTP and expiry
		const currentTime = new Date();
		const expiresAt = new Date(currentTime.getTime() + 60000 * 5);

		await AuthModel.findOneAndUpdate(
			{ email: data?.email },
			{
				"email_management.login.token": otp,
				"email_management.login.expires_at": expiresAt,
			},
			{
				new: true,
			},
		);

		await EmailEvent.sendOtpMail({
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			email: data!.email,
			otp: otp,
		});

		try {
			SendResponse.success(res, "OTP sent successfully. Please verify.", {});
		} catch (e: any) {
			SendResponse.serverError(res, e.message);
		}
	},

	async ping(req: Request, res: Response): Promise<void> {
		const currentUser = res.locals.user;

		const packages = res.locals.packages;

		try {
			SendResponse.success(res, "", {
				user: currentUser,
				packages,
			});
		} catch (e: any) {
			SendResponse.serverError(res, e.message);
		}
	},
};
export default AdminAuthController;
