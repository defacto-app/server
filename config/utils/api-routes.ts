import fs from "node:fs";
import { $file } from "../config";

export class HandlePayload {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	constructor(private listApis: any[]) {
		// You may want to use a specific interface instead of 'any[]'
		// this.writeToFile().then();
		/*   this.convertToOpenApi().then(() =>
         console.log("OpenAPI specification written to file.")
      );*/
	}

	private async writeToFile(): Promise<void> {
		const data: string = JSON.stringify(this.listApis, null, 2);
		const filePath = `${$file.json}/routes.json`;

		try {
			await fs.promises.writeFile(filePath, data, "utf8");
			console.log("Data written to file");
		} catch (err) {
			console.error("An error occurred while writing to file:", err);
		}
	}

	private async convertToOpenApi(): Promise<void> {
		// Basic structure for OpenAPI
		const openApiTemplate = {
			openapi: "3.0.0",
			info: {
				title: "My API",
				version: "1.0.0",
			},
			paths: {},
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} as any;

		// Populate paths object based on listApis
		for (const endpoint of this.listApis) {
			const methods = endpoint.methods.reduce(
				(
					acc: {
						[x: string]: {
							summary: string; // You should fill in summary and other details manually
							responses: {
								"200": { description: string }; // The response object should be defined based on actual API
							};
						};
					},
					method: string,
				) => {
					acc[method.toLowerCase()] = {
						summary: "", // You should fill in summary and other details manually
						responses: {
							"200": { description: "Success" }, // The response object should be defined based on actual API
						},
					};
					return acc;
				},
				{},
			);

			openApiTemplate.paths[endpoint.path] = methods;
		}

		const data: string = JSON.stringify(openApiTemplate, null, 2);
		const filePath = `${$file.json}/openapi-spec.json`;

		try {
			await fs.promises.writeFile(filePath, data, "utf8");
			// console.log("done writing to file");
		} catch (err) {
			console.error("An error occurred while writing to file:", err);
		}
	}
}
