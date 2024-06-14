export const functionSchema = {
  name: "extract_invoice_data",
  description: "Extracts structured data from an invoice image",
  parameters: {
    type: "object",
    properties: {
      payeeName: { type: "string" },
      payeeVatNumber: { type: "string" },
      invoiceNumber: { type: "string" },
      purchaseOrderNumber: { type: "string" },
      invoiceDate: { type: "string", format: "date" },
      invoiceDueDate: { type: "string", format: "date" },
      totalAmount: { type: "string" },
      netAmount: { type: "string" },
      taxAmount: { type: "string" },
      currency: { type: "string" },
      shippingCost: { type: "string" },
      discount: { type: "string" },
      lineItems: {
        type: "array",
        items: {
          type: "object",
          properties: {
            description: { type: "string" },
            quantity: { type: "string" },
            unitPrice: { type: "string" },
            lineNetAmount: { type: "string" },
            lineTaxAmount: { type: "string" },
            lineTotalAmount: { type: "string" },
            itemNumber: { type: "string" },
            unitOfMeasure: { type: "string" },
            unitOfMeasureId: { type: "string" },
          },
          required: ["description", "quantity", "unitPrice", "lineNetAmount"], //maybe remove
        },
      },
      extraData: {
        type: "object",
        properties: {},
      },
    },
    required: [
      "payeeName",
      "invoiceNumber",
      "invoiceDate",
      "totalAmount",
      "lineItems",
    ],
  },
};
