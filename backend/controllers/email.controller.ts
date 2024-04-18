import { Request, Response } from "express";

import FormValidator from "../validator/form.validator";

const EmailController = {
   async contact(req: Request, res: Response): Promise<void> {
      const body = req.body as any;

      console.log(body);

      // await EmailEvent.sendContactMail(body);

      try {
         const { value, errors } = await FormValidator.contact(body);

         if (errors) {
            // get length of errors

            const total_errors = Object.keys(errors).length as number;

            res.status(400).json({
               type: "form",
               errors,
               message: "Invalid Form Submission",
               description: `
        There is atleast ${total_errors} error${total_errors > 1 ? "s" : ""} on this form! `,
            });

            return;
         }

         res.status(200).json({
            message: "Email sent successfully",
         });
      } catch (e) {
         res.status(500).json({
            error: e,
         });
      }
   },
};

export default EmailController;
