import type { Request, Response } from "express";
import SendResponse from "../libs/response-helper";
import env from "../../config/env";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Flutterwave = require("flutterwave-node-v3"); // Use default import
const flw = new Flutterwave(
	env.FLUTTER_WAVE.TEST.PUBLIC_KEY,
	env.FLUTTER_WAVE.TEST.SECRET_KEY,
);

const PaymentController = {
	async chargeBankAccount(req: Request, res: Response): Promise<void> {
		try {
			const { amount, email, phone_number, fullname } = req.body;

			const payload = {
				tx_ref: `MC-${Date.now()}`,  // Unique transaction reference
				amount: amount,
				currency: "NGN",  // Nigerian Naira
				email: email,
				phone_number: phone_number,
				fullname: fullname,
			};

			// Call Flutterwave Charge API for Nigerian bank account
			const response = await flw.Charge.ng(payload);

			// Send the response back to the client
			SendResponse.success(res, "Bank account charge initiated", response);
		} catch (error) {
			console.error(error);
			SendResponse.serverError(res, "Failed to initiate bank account charge");
		}
	}
};

export default PaymentController;
/*			const payload = {
				tx_ref: Date.now().toString(),  // Unique transaction reference (use toString() for safety)
				amount: amount,
				currency: currency || "USD",  // Default to USD if no currency is provided
				redirect_url: "https://your-nextjs-app.com/payment-success",  // Redirect on success
				payment_options: "card",  // Payment options (card, mobilemoney, etc.)
				customer: {
					email: email,
				},
				customizations: {
					title: "Your App Name",
					description: "Payment for items in cart",
				},
			};

			const response = await flw.Payment.initialize(payload);*/

// SendResponse.success(res, "Payment link generated", response);
