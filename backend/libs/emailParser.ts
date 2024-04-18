// Read the header, footer, and main content templates
import fs from "fs";
import handlebars from "handlebars";
import { EmailTitleType } from "../../types";
import env from "../../config/env";

const emailFolder = fs.realpathSync(`${__dirname}/../../views/emails`);

console.log(emailFolder);

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

   const emailTemplateSource = fs.readFileSync(
      `${emailFolder}/${title}.hbs`,
      "utf8"
   );

   // Compile the templates
   handlebars.registerPartial("styles", styleSource);
   handlebars.registerPartial("header", headerSource);
   handlebars.registerPartial("footer", footerSource);

   // Register the footer partial with default data (e.g., year)
   // const compiledFooter = handlebars.compile(footerSource);
   // const compiledHeader = handlebars.compile(headerSource);
   /*   const footerWithData = compiledFooter({
        year: new Date().getFullYear(),
        slogan: website.slogan,
        website: website.name,
        clientUrl
    });*/
   /*
    const headerWithData = compiledHeader({
        slogan: website.slogan,
        logo: website.email_logo,
        clientUrl,
        website: website.name
    });
*/

   // handlebars.registerPartial("header", headerWithData);
   // handlebars.registerPartial("footer", footerWithData);

   return handlebars.compile(emailTemplateSource);
}
