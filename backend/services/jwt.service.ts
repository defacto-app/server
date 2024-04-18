import jwt from "jsonwebtoken";
import { UserDataType } from "../model/user.model";
import env from "../../config/env";
import { isDev } from "../../config/config";

export function generateToken(user: UserDataType): string {
   return jwt.sign({ id: user.id }, env.JWT_SECRET, {
      expiresIn: isDev ? "1h" : "5h",
   });
}

export function verifyToken(token: string): Promise<any> {
   return new Promise((resolve, reject) => {
      jwt.verify(token, env.JWT_SECRET, (err: any, decoded: any) => {
         if (err) {
            reject(err);
         }
         return resolve(decoded);
      });
   });
}
