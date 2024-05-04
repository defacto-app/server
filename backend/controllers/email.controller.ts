import { Request, Response } from "express";



const EmailController = {
      async verify_email(req: Request, res: Response) {
         return res.json({ message: "Email Verified" });
      }
};

export default EmailController;