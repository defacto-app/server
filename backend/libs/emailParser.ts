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
	// const { website, clientUrl } = getEmailData();

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

	// Compile the templates
	handlebars.registerPartial("styles", styleSource);
	handlebars.registerPartial("header", headerSource);
	handlebars.registerPartial("footer", footerSource);
	handlebars.registerPartial("button", buttonSource);

	const compiledFooter = handlebars.compile(footerSource);
	const compiledHeader = handlebars.compile(headerSource);
	const compiledButton = handlebars.compile(buttonSource);

	const website = {
		name: "Defacto App",
		slogan: "We are the best",
		logo: `${env.BASE_URL}/assets/email-logo.png`,
		domain: `${env.FRONTEND_URL}`,
	};

	const footerWithData = compiledFooter({
		year: new Date().getFullYear(),
		...website,
	});

	const buttonWithData = compiledButton({
		link: data?.link,
	});

	const headerWithData = compiledHeader(website);

	handlebars.registerPartial("header", headerWithData);
	handlebars.registerPartial("footer", footerWithData);
	handlebars.registerPartial("button", buttonWithData);

	return handlebars.compile(emailTemplateSource);
}
