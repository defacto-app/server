import { NextFunction, Request, Response } from "express";

import { supabase } from "../../config/supabase.config";

class AuthMiddleware {
   public async validateUser(req: Request, res: Response, next: NextFunction) {
      const authorization = req.headers["authorization"] as string;



      if (!authorization) {
         return res.status(401).json({ error: "Authorization token required" });
      }

      const token = authorization.split(" ")[1];


      try {

         const { data, error } = await supabase.auth.getUser(token);

         if (error) {
            return res.status(401).json({ error: "Invalid token" });
         }

         const user = data;



         if (!user) {
            return res.status(401).json({ error: "Invalid token ??===" });
         }

         res.locals.user = user;

         // update last seen

         return next();
      } catch (error) {
         return res.status(401).json({ error: "Invalid token" });
      }
   }

   public async ensureAuthenticated(
      req: Request,
      res: Response,
      next: NextFunction,
   ) {
      if (req.isAuthenticated()) {
         return next();
      }

      res.status(401).json({ error: "You are not authenticated !!" });
   }
}

// Additional methods for loading user, checking admin rights, etc., can be added here

export default new AuthMiddleware();


// prv_9OYqXaTesl62yFvqJUQ8Eocz6isenfCeh-Z7BonyJLOa_3rAaC40CTXU
