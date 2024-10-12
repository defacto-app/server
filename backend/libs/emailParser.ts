// Read the header, footer, and main content templates
import fs from "node:fs";
import handlebars from "handlebars";
import type { EmailTitleType } from "../../types";
import env from "../../config/env";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const emailFolder = path.join(__dirname, "../../views/emailTemplate");

export function getEmailData() {
	const senderEmail = env.EMAIL_SENDER;
	const senderFromText = `katalsyt Tech <${senderEmail}>`;

	return {
		senderEmail,
		senderFromText,
	};
}

export function getEmailTemplates(title: EmailTitleType, data?: any) {
	const styleSource = fs.readFileSync(
		`${emailFolder}/commons/styles.hbs`,
		"utf8",
	);
	const headerSource = fs.readFileSync(
		`${emailFolder}/commons/header.hbs`,
		"utf8",
	);
	const footerSource = fs.readFileSync(
		`${emailFolder}/commons/footer.hbs`,
		"utf8",
	);
	const buttonSource = fs.readFileSync(
		`${emailFolder}/commons/button.hbs`,
		"utf8",
	);
	const emailTemplateSource = fs.readFileSync(
		`${emailFolder}/${title}.hbs`,
		"utf8",
	);

	// Register partials once
	handlebars.registerPartial("styles", styleSource);
	handlebars.registerPartial("header", headerSource);
	handlebars.registerPartial("footer", footerSource);
	handlebars.registerPartial("button", buttonSource);

	// Compile the main email template
	const compiledEmailTemplate = handlebars.compile(emailTemplateSource);

	// Return the compiled function, which can accept data
	return (data: any) => {
		const website = {
			name: "Defacto",
			slogan: "We are the best",
			logo: `${env.BASE_URL}/assets/email-logo.png`,
			domain: `${env.FRONTEND_URL}`,
		};

		// Merge website and provided data
		return compiledEmailTemplate({
			website, // Pass website object to the email template
			...data, // Spread other possible data (like link, etc.)
		});
	};
}
