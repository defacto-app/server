import dotenv from "dotenv";

const envs = dotenv.config({ path: ".env" });

const isDev = process.env.NODE_ENV === "development";

const env = {
   BASE_URL: envs.parsed?.BASE_URL || `http://localhost:${envs.parsed?.APP_PORT}`,
   MONGODB_SERVER: envs.parsed?.MONGODB_SERVER,
   MONGODB_DATABASE: envs.parsed?.MONGODB_DATABASE,
   MONGODB_PASSWORD: envs.parsed?.MONGODB_PASSWORD,
   COINMARKETCAP_API_KEY: envs.parsed?.COINMARKETCAP_API_KEY,
   JWT_SECRET: envs.parsed?.JWT_SECRET || "secret",
   APP_PORT: envs.parsed?.APP_PORT,
   isDev: isDev,

   //email
   EMAIL_USER: envs.parsed?.EMAIL_USER,
   EMAIL_PASSWORD: envs.parsed?.EMAIL_PASSWORD,
   EMAIL_SENDER: envs.parsed?.EMAIL_SENDER,
   EMAIL_RECEIVER: envs.parsed?.EMAIL_RECEIVER,
   EMAIL_PORT: Number(envs.parsed?.EMAIL_PORT),
   EMAIL_HOST: envs.parsed?.EMAIL_HOST,
   SUPABASE_KEY: envs.parsed?.SUPABASE_KEY || "",
   SUPABASE_URL: envs.parsed?.SUPABASE_URL || "",
   SUPABASE_SERVICE_ROLE: envs.parsed?.SUPABASE_SERVICE_ROLE || "",
   TERMIAPIKEY: envs.parsed?.TERMIAPIKEY || "",
};

export default env;
