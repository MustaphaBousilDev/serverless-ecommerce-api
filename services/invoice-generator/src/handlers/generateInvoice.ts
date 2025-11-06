import { SQSEvent, SQSHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import PDFDocument from 'pdfkit';

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1'
})
const BUCKET_NAME = process.env.INVOICES_BUCKET_NAME || ''
console.log('🪣 BUCKET_NAME from env:', process.env.INVOICES_BUCKET_NAME);
console.log('🪣 BUCKET_NAME constant:', BUCKET_NAME);
interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  status: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  createdAt: string;
  timestamp: string;
}

export const handler: SQSHandler = async (event: SQSEvent): Promise<void>=> {
    console.log(
        'Invoice Generator triggered with', 
        event.Records.length, 
        'messages'
    );
    for(const record of event.Records){
        try {
            //parsing EventBridge event from SQS message
            const eventBridgeEvent = JSON.parse(record.body)
            const orderData: OrderCreatedEvent = eventBridgeEvent.detail
            console.log('=== Generating invoice for order:', orderData.orderId)
            const pdfBuffer = await generateInvoicePDF(orderData)

            //upload to s3
            const s3Key = `invoices/${orderData.userId}/${orderData.orderId}.pdf`
            console.log('📤 About to upload to S3:');
            console.log('   Bucket:', BUCKET_NAME);
            console.log('   Key:', s3Key);
            console.log('   Buffer size:', pdfBuffer.length);
            await s3Client.send(
                new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: s3Key,
                    Body: pdfBuffer,
                    ContentType: 'application/pdf',
                    Metadata: {
                        orderId: orderData.orderId,
                        userId: orderData.userId,
                        generatedAt: new Date().toISOString()
                    }
                })
            )
            console.log('✅ Invoice uploaded to S3:', s3Key);
        } catch(error) {
            console.error('❌ Error generating invoice:', error);
            throw error; // This will send message to DLQ after retries
        }
    }

    


}

async function generateInvoicePDF(order: OrderCreatedEvent): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      // Collect PDF data
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .text('INVOICE', 50, 50, { align: 'center' })
        .moveDown();

      // Invoice Info
      doc
        .fontSize(10)
        .text(`Invoice #: ${order.orderId}`, 50, 100)
        .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 115)
        .text(`Order Status: ${order.status}`, 50, 130)
        .moveDown();

      // Customer Info
      doc
        .fontSize(12)
        .text('Bill To:', 50, 160)
        .fontSize(10)
        .text(`User ID: ${order.userId}`, 50, 180)
        .moveDown();

      // Shipping Address
      doc
        .fontSize(12)
        .text('Ship To:', 50, 210)
        .fontSize(10)
        .text(order.shippingAddress.street, 50, 230)
        .text(
          `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`,
          50,
          245
        )
        .text(order.shippingAddress.country, 50, 260)
        .moveDown(2);

      // Items Table Header
      const tableTop = 300;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')  // ← Use font method instead of bold property
        .text('Item', 50, tableTop)
        .text('Quantity', 250, tableTop)
        .text('Unit Price', 350, tableTop)
        .text('Total', 450, tableTop)
        .font('Helvetica');

      // Draw line under header
      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      // Items
      let currentY = tableTop + 25;
      order.items.forEach((item) => {
        const itemTotal = item.quantity * item.unitPrice;
        
        doc
          .fontSize(9)
          .text(item.productName, 50, currentY, { width: 180 })
          .text(item.quantity.toString(), 250, currentY)
          .text(`$${item.unitPrice.toFixed(2)}`, 350, currentY)
          .text(`$${itemTotal.toFixed(2)}`, 450, currentY);

        currentY += 25;
      });

      // Draw line before total
      doc
        .moveTo(50, currentY + 5)
        .lineTo(550, currentY + 5)
        .stroke();

      // Total
      currentY += 20;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')  // ← Use font method
        .text('Total Amount:', 350, currentY)
        .text(`$${order.totalAmount.toFixed(2)}`, 450, currentY)
        .font('Helvetica');

      // Footer
      doc
        .fontSize(8)
        .text(
          'Thank you for your business!',
          50,
          doc.page.height - 100,
          { align: 'center' }
        )
        .text(
          'For support, contact: support@example.com',
          50,
          doc.page.height - 80,
          { align: 'center' }
        );

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}