export type EmailTitleType = "contact" | "reset-password" | "verify-email" | "otp";

export interface authBodyType {
	email?: string;
	password: string;
	phoneNumber?: string;
}

export interface SuccessResponseType {
	message: string;
	success: boolean;
	data: any;
	timestamp: Date;
}

export interface ErrorResponseType {
	message: string;
	success: boolean;
	data: any;
	timestamp: Date;
}

export interface dropOffDetailsType {
	name: string;
	phone: string;
	email: string;
	address: AddressType;
}

export interface pickupDetailsType {
	name: string;
	phone: string;
	email: string;
	address: AddressType;
}

export interface AddressType {
	label: string;
	location: string;
	coordinates: {
		lat: number;
		lng: number;
	};
	additionalDetails: string;
}


export interface CategorySearchParams {
	search?: string;
	page?: number;
	perPage?: number;
	sortField?: string;
	sortOrder?: "asc" | "desc";
}

export interface CategorySearchResult {
	data: any[];
	meta: {
		page: number;
		perPage: number;
		total: number;
		totalPages: number;
	};
}