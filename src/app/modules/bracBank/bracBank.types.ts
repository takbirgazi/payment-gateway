export interface CreatePaymentDTO {
    amount: string;
    currency: string;
  }
  
  export interface CyberSourceForm {
    payUrl: string;
    fields: Record<string, string>;
  }
  