export type EmailTitleType = "contact" | "reset-password" | "verify-email";

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
   address: string;
   location: string;
   coordinates: {
      lat: number;
      lng: number;
   };
}
