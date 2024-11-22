import type { Request, Response } from "express";
import SendResponse from "../libs/response-helper";
import env from "../../config/env";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Flutterwave = require("flutterwave-node-v3"); // Use default import
const flw = new Flutterwave(
	env.FLUTTER_WAVE.TEST.PUBLIC_KEY,
	env.FLUTTER_WAVE.TEST.SECRET_KEY,
);
import open from 'open';
import axios from "axios";

const PaymentController = {
	async cardPayment(req: Request, res: Response): Promise<void> {
		try {
			const { email, phone_number, fullname } = req.body;

			// Card charge payload based on provided data and a test card
			const payload = {
				card_number: "5531886652142950", // Test card number
				cvv: "564",                     // Test CVV
				expiry_month: "09",              // Expiry month
				expiry_year: "32",               // Expiry year (extended)
				currency: "NGN",                 // Nigerian Naira
				amount: 1000,                  // Use the amount from the request body
				redirect_url: "https://your-site.com/payment-success", // Redirect after authorization
				fullname: fullname,              // Customer full name from request
				email: email,                    // Customer email from request
				phone_number: phone_number,      // Customer phone number from request
				enckey: env.FLUTTER_WAVE.TEST.ENCRYPTION_KEY, // Flutterwave encryption key
				tx_ref: `MC-${Date.now()}`,      // Unique transaction reference
			};

			// Call Flutterwave Charge API for card payment
			const response = await flw.Charge.card(payload);

			console.log(response);

			// Handle different types of authorization (PIN, OTP, redirect)
			if (response.meta.authorization.mode === "pin") {
				// For PIN transactions, prompt the user to input their PIN
				const pinPayload = {
					...payload,
					authorization: {
						mode: "pin",
						pin: 3310, // PIN value (for demo purposes)
					},
				};

				// Re-initiate the card charge with the PIN
				const reCallCharge = await flw.Charge.card(pinPayload);

				// Handle OTP validation (replace with real OTP in production)
				const validatePayload = {
					otp: "12345",  // OTP for validation (for demo purposes)
					flw_ref: reCallCharge.data.flw_ref,  // Reference from the previous charge
				};
				const callValidate = await flw.Charge.validate(validatePayload);
				console.log(callValidate);

				// Send success response after OTP validation
				SendResponse.success(res, "Card charge successful", callValidate);
			} else if (response.meta.authorization.mode === "redirect") {
				// If 3D Secure or VBV is required, redirect the user
				const redirectUrl = response.meta.authorization.redirect;
				await open(redirectUrl); // Open the redirect URL in the browser

				// Send redirect response
				SendResponse.success(res, "Redirecting to authorization", { redirectUrl });
			} else {
				// If no special authorization is required, send the raw response
				SendResponse.success(res, "Card charge initiated", response);
			}
		} catch (error) {
			console.error(error);
			SendResponse.serverError(res, "Failed to initiate bank account charge");
		}
	},

	async verifyTransaction(req: Request, res: Response): Promise<void> {
		try {
			const { transaction_id } = req.body;
			// Make request to Flutterwave's transaction verification endpoint
			const response = await axios.get(
				`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
				{
					headers: {
						Authorization: `Bearer ${env.FLUTTER_WAVE.TEST.SECRET_KEY}`,
					},
				}
			);


			// Check the status of the verification response
			if (response.data.status === "success") {
				const transactionData = response.data.data;

				// Process the transaction data here (e.g., store it in your database)
				console.log("Transaction verified:", transactionData);


				SendResponse.success(res, "Transaction verified", transactionData);
			} else {

				SendResponse.badRequest(res, "Transaction verification failed");

			}




		} catch (error) {
			console.error(error);
			SendResponse.serverError(res, "Failed to verify transaction");
		}
	},

	async webhook(req: Request, res: Response): Promise<void> {
		const payload = req.body;

		// You should validate the webhook source by checking Flutterwave's signature
		const secretHash = env.FLUTTER_WAVE.TEST.WEBHOOK_SECRET;
		const hash = req.headers['verif-hash'];

		if (!hash || hash !== secretHash) {
			SendResponse.forbidden(res, "Invalid request signature");
		}

		try {
			if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
				// Payment is successful
				console.log("Webhook received: Payment successful", payload.data);

				// Update your order/payment status in your database here
				// Example: saveTransaction(payload.data);


				SendResponse.success(res, "Payment processed successfully", payload);
			}

			// You can handle other events like failed payments, refunds, etc.

			SendResponse.success(res, "Webhook received but not processed", payload);
		} catch (error) {
			console.error("Error processing webhook:", error);

			SendResponse.serverError(res, "Failed to process webhook");
		}
	}
}

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
