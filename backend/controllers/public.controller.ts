import type { Request, Response } from "express";
import axios from "axios";
import env from "../../config/env";
import EmailEvent from "../events/email.event";
import SendResponse from "../libs/response-helper";

const PublicController = {
   async google_api(req: Request, res: Response): Promise<void> {
      const { input } = req.query;

      try {
         const response = await axios.get(
            // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
            `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
            {
               params: {
                  input,
                  key: env.GOOGLE_MAPS_API_KEY,
               },
            }
         );

         res.json(response.data);
      } catch (error) {
         res.status(500).send("Error fetching places");
      }
   },

   async get_place_details(req: Request, res: Response): Promise<void> {
      const { place_id } = req.query;

      try {
         const response = await axios.get(
            "https://maps.googleapis.com/maps/api/place/details/json",
            {
               params: {
                  place_id,
                  key: env.GOOGLE_MAPS_API_KEY,
               },
            }
         );

         res.json(response.data);
      } catch (error) {
         res.status(500).send("Error fetching place details");
      }
   },

   async contact(req: Request, res: Response): Promise<void> {
      const { fullName, phoneNumber, email, message } = req.body;
      console.log("Contact form submitted:", {
         fullName,
         phoneNumber,
         email,
         message,
      });

      try {
         await EmailEvent.sendContactMail({
            fullName,
            phoneNumber,
            email,
            message,
         });

         SendResponse.success(res, "Message sent successfully");
      } catch (error) {
         SendResponse.serverError(res, error);
      }
   },
};

export default PublicController;
