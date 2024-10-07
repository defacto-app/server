import dotenv from "dotenv";

const envs = dotenv.config({ path: ".env" });

const isDev = process.env.NODE_ENV === "development";

const env = {
	BASE_URL:
		envs.parsed?.BASE_URL || `http://localhost:${envs.parsed?.APP_PORT}`,
	//
	FRONTEND_URL: envs.parsed?.FRONTEND_URL,
	API_URL: envs.parsed?.API_URL,

	//
	MONGODB_SERVER: envs.parsed?.MONGODB_SERVER,
	MONGODB_DATABASE: envs.parsed?.MONGODB_DATABASE,
	MONGODB_PASSWORD: envs.parsed?.MONGODB_PASSWORD,

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
	GOOGLE_MAPS_API_KEY: envs.parsed?.GOOGLE_MAPS_API_KEY || "",

	// cloudinary

	CLOUDINARY_CLOUD_NAME: envs.parsed?.CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY: envs.parsed?.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: envs.parsed?.CLOUDINARY_API_SECRET,
	FLUTTER_WAVE:{
		TEST:{
			SECRET_KEY:"FLWSECK_TEST-f96b49a5ddc287ae7755b7c07ea3c966-X",
			PUBLIC_KEY:"FLWPUBK_TEST-96705e03241aa286fd1bdb8154885983-X",
			ENCRYPTION_KEY:"FLWSECK_TEST03314bfacfc8",
		},
		PRODUCTION:{}
	}

	// SMTP_FROM_EMAIL: envs.parsed?.SMTP_FROM_EMAIL,
};

export default env;
