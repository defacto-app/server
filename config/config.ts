import path from "path";
interface FilePaths {
   [key: string]: string;
}

const baseStorage = path.join(__dirname, "../storage");

export const $file: FilePaths = {
   storage: baseStorage,
   json: path.join(baseStorage, "json"),
   public: path.join(baseStorage, "public"),
   projects: path.join(baseStorage, "uploads/projects"),
   teams: path.join(baseStorage, "uploads/teams"),
   logos: path.join(baseStorage, "uploads/logos"),
};

export const isDev = process.env.NODE_ENV === "development";
