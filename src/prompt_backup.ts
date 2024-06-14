const extractDataPrompt = (fileContent: string, base64Image: string) => `
Please analyze the following invoice image and extract the data in JSON format.

Invoice Image:
data:image/jpeg;base64,${base64Image}

Extract the following data from the invoice:

- Payee name
- Payee VAT number (if available)
- Invoice number
- Purchase order number
- Invoice date (in YYYY-MM-DD format)
- Invoice due date (in YYYY-MM-DD format)
- Total amount
- Net amount (subtotal before tax)
- Tax amount
- Currency (if available)
- Shipping cost (if available)
- Discount (if available)
- Line items (an array) with each item containing:
  - Description
  - Quantity
  - Unit price
  - Line net amount
  - Line tax amount
  - Line total amount
  - Item number (if available)
  - Unit of measure (if available)
  - Unit of measure ID (if available)

If there is any other information that you can extract from the document, add it inside an object called "extraData".

Document content (for reference):
${fileContent}

Return the data in the following JSON format:
{
  "payeeName": "",
  "payeeVatNumber": "",
  "invoiceNumber": "",
  "purchaseOrderNumber": "",
  "invoiceDate": "",
  "invoiceDueDate": "",
  "totalAmount": "",
  "netAmount": "",
  "taxAmount": "",
  "currency": "",
  "shippingCost": "",
  "discount": "",
  "lineItems": [
    {
      "description": "",
      "quantity": "",
      "unitPrice": "",
      "lineNetAmount": "",
      "lineTaxAmount": "",
      "lineTotalAmount": "",
      "itemNumber": "",
      "unitOfMeasure": "",
      "unitOfMeasureId": ""
    }
  ],
  "extraData": {}
}
`;

export default extractDataPrompt;
