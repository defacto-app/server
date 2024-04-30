interface FilePaths {
   [key: string]: string;
}

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const baseStorage = path.join(__dirname, '../storage');

export const $file: FilePaths = {
   storage: baseStorage,
   json: path.join(baseStorage, "json"),
   public: path.join(baseStorage, "public"),
   projects: path.join(baseStorage, "uploads/projects"),
   teams: path.join(baseStorage, "uploads/teams"),
   logos: path.join(baseStorage, "uploads/logos"),
};

export const isDev = process.env.NODE_ENV === "development";
