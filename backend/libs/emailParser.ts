// Read the header, footer, and main content templates
import fs from "fs";
import handlebars from "handlebars";
import { EmailTitleType } from "../../types";
import env from "../../config/env";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));


const emailFolder = path.join(__dirname, "../../views/emailTemplate");

console.log(path.resolve(emailFolder), "email-folder");
console.log('__dirname:', __dirname);
console.log('emailFolder:', emailFolder);// See what this resolves to

export function getEmailData() {
   const senderEmail = env.EMAIL_SENDER;
   const senderFromText = `katalsyt Tech <${senderEmail}>`;

   return {
      senderEmail,
      senderFromText,
   };
}

export function getEmailTemplates(title: EmailTitleType) {
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

   const button = fs.readFileSync(
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
   handlebars.registerPartial("button", button);

   return handlebars.compile(emailTemplateSource);
}
