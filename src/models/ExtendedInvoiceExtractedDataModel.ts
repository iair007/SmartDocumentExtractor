export interface LineItem {
    description: string;
    quantity: string;
    unitPrice: string;
    lineNetAmount: string;
    lineTaxAmount: string;
    lineTotalAmount: string;
    itemNumber: string;
    unitOfMeasure: string;
    unitOfMeasureId: {
      $numberLong: string;
    };
  }
  
  export interface ExtractedData {
    _t: string;
    payeeName: string;
    payeeVatNumber: string;
    invoiceNumber: string;
    purchaseOrderNumber: string;
    invoiceDate: {
      $date: string;
    };
    invoiceDueDate: {
      $date: string;
    };
    totalAmount: string;
    netAmount: string;
    taxAmount: string;
    currency: string;
    shippingCost: string;
    discount: string;
    lines: LineItem[];
  }
  
  export interface ExtendedInvoiceExtractedDataModel {
    attachedResourceId: string;
    extractedData: ExtractedData;
  }
  