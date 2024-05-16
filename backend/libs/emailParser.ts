// Read the header, footer, and main content templates
import fs from "fs";
import handlebars from "handlebars";
import { EmailTitleType } from "../../types";
import env from "../../config/env";
import path from "path";
import { fileURLToPath } from "url";

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
      "utf8"
   );
   const headerSource = fs.readFileSync(
      `${emailFolder}/commons/header.hbs`,
      "utf8"
   );
   const footerSource = fs.readFileSync(
      `${emailFolder}/commons/footer.hbs`,
      "utf8"
   );

   const buttonSource = fs.readFileSync(
      `${emailFolder}/commons/button.hbs`,
      "utf8"
   );

   const emailTemplateSource = fs.readFileSync(
      `${emailFolder}/${title}.hbs`,
      "utf8"
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
      logo: "https://api.defactoapp.com.ng/assets/email-logo.png",
      domain: "https://defactoapp.com.ng",
   };

   const footerWithData = compiledFooter({
      year: new Date().getFullYear(),
      ...website,
   });

   const buttonWithData = compiledButton({
      domain: website.domain,
      link: data?.link,
   });

   const headerWithData = compiledHeader(website);

   handlebars.registerPartial("header", headerWithData);
   handlebars.registerPartial("footer", footerWithData);
   handlebars.registerPartial("button", buttonWithData);

   return handlebars.compile(emailTemplateSource);
}
