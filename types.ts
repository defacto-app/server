export type EmailTitleType =
   | "contact"
   | "reset-password"
   | "verify-email"
   | "otp"
   | "email-change";

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

export interface AddressType {
   branchName?: string;
   fullAddress: string;
   coordinates: {
      latitude: number;
      longitude: number;
   };
   additionalDetails: string;
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
