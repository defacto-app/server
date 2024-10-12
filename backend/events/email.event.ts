import { eventEmitter } from "../../config/eventEmitter";
import { getEmailTemplates } from "../libs/emailParser";
import env from "../../config/env";

const EmailEvent = {
	async sendContactMail(data: { email: string; message: string }) {
		try {
			eventEmitter.emit("sendContactMail", data);
		} catch (e) {
			console.error("Error during update:", e);
		}
	},

	async sendWelcomeMail(data: { email: string; link: string }) {
		const compileEmail = getEmailTemplates("verify-email", data);
		const html = compileEmail({ link: data.link });
		try {
			eventEmitter.emit("sendWelcomeMail", {
				email: data.email,
				html: html,
				message: `Welcome to ${env.APP_NAME}`,
			});
		} catch (e) {
			console.error("Error during update:", e);
		}
	},

	async sendPasswordResetMail(data: { email: string; link: string }) {
		const compileEmail = getEmailTemplates("verify-email", data);
		const html = compileEmail({ link: data.link });
		try {
			eventEmitter.emit("sendWelcomeMail", {
				email: data.email,
				html: html,
				message: `Welcome to ${env.APP_NAME}`,
			});
		} catch (e) {
			console.error("Error during update:", e);
		}
	},

	async sendOtpMail(data: { email: string; otp: string;  }) {
		const compileEmail = getEmailTemplates("otp", data);
		const html = compileEmail({ otp: data.otp });
		try {
			eventEmitter.emit("sendOtpMail",{
				email: data.email,
				html: html,
				message: "one time Otp",
			});
		} catch (e) {
			console.error("Error during update:", e);
		}
	}
};

export default EmailEvent;
