import type { Request, Response } from "express";
import { getEmailTemplates } from "../libs/emailParser";

const EmailController = {
	async verify_email(req: Request, res: Response) {
		const user = {
			name: "John Doe",
			verifyUrl: "http://example.com/verify?token=sometoken",
		};

		/*    const template = Handlebars.compile("Name: {{name}}");
          console.log(template({ name: "Nils" }));*/
		const welcome = getEmailTemplates("verify-email");

		return res.send(welcome(user));
	},
};

export default EmailController;
