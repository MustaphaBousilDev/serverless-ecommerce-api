import { SQSEvent, SQSHandler } from 'aws-lambda';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });
const FROM_EMAIL = process.env.FROM_EMAIL || 'bousilmustapha@gmail.com';

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

interface OrderStatusChangedEvent {
  orderId: string;
  userId: string;
  oldStatus: string;
  newStatus: string;
  totalAmount: number;
  updatedAt: string;
  timestamp: string;
}

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
    console.log('==== Email Notifier triggered with', event.Records.length, 'messages');
    for(const record of event.Records){
       try {
          const eventBridgeEvent = JSON.parse(record.body);
          const eventType = eventBridgeEvent['detail-type'];

          console.log('📨 Processing event type:', eventType);

          if (eventType === 'OrderCreated') {
            await handleOrderCreated(eventBridgeEvent.detail);
          } else if (eventType === 'OrderStatusChanged') {
            await handleOrderStatusChanged(eventBridgeEvent.detail);
          } else {
            console.log('⚠️ Unknown event type:', eventType);
          }
       } catch(error) {
           console.error('❌ Error processing email notification:', error);
           throw error;
       }
    }
}

async function handleOrderCreated(order: OrderCreatedEvent): Promise<void> {
  console.log('📧 Sending order confirmation email for:', order.orderId);

  const emailBody = generateOrderConfirmationEmail(order);
  const emailFromDatabase = 'mugiwaraf0789@gmail.com'
  const testEmail = true

  await sendEmail(
    FROM_EMAIL,
    testEmail ? emailFromDatabase : order.userId, // In real app, fetch user's email from database
    'Order Confirmation - Your Order Has Been Placed!',
    emailBody
  );

  console.log('✅ Order confirmation email sent for:', order.orderId);
}

async function handleOrderStatusChanged(event: OrderStatusChangedEvent): Promise<void> {
  console.log('📧 Sending order status update email for:', event.orderId);

  const emailBody = generateOrderStatusEmail(event);

  await sendEmail(
    FROM_EMAIL,
    event.userId, // In real app, fetch user's email from database
    `Order Update - Status Changed to ${event.newStatus}`,
    emailBody
  );

  console.log('✅ Order status email sent for:', event.orderId);
}

function generateOrderConfirmationEmail(order: OrderCreatedEvent): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.quantity * item.unitPrice).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .total { font-size: 18px; font-weight: bold; text-align: right; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Order Confirmation</h1>
    </div>
    <div class="content">
      <p>Dear Customer,</p>
      <p>Thank you for your order! We're excited to confirm that we've received your order and it's being processed.</p>
      
      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      
      <h3>Items Ordered:</h3>
      <table>
        <thead>
          <tr style="background: #f0f0f0;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: center;">Quantity</th>
            <th style="padding: 10px; text-align: right;">Unit Price</th>
            <th style="padding: 10px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div class="total">
        Total Amount: $${order.totalAmount.toFixed(2)}
      </div>
      
      <h3>Shipping Address:</h3>
      <p>
        ${order.shippingAddress.street}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
        ${order.shippingAddress.country}
      </p>
      
      <p style="margin-top: 30px;">We'll send you another email when your order ships.</p>
      
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>The E-Commerce Team</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
      <p>&copy; 2025 E-Commerce Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateOrderStatusEmail(event: OrderStatusChangedEvent): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .status { background: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Order Status Update</h1>
    </div>
    <div class="content">
      <p>Dear Customer,</p>
      <p>Your order status has been updated!</p>
      
      <p><strong>Order ID:</strong> ${event.orderId}</p>
      <p><strong>Previous Status:</strong> ${event.oldStatus}</p>
      <p><strong>New Status:</strong> <span class="status">${event.newStatus}</span></p>
      <p><strong>Updated At:</strong> ${new Date(event.updatedAt).toLocaleString()}</p>
      
      ${getStatusMessage(event.newStatus)}
      
      <p style="margin-top: 30px;">Thank you for your patience!</p>
      
      <p>Best regards,<br>The E-Commerce Team</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply.</p>
      <p>&copy; 2025 E-Commerce Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return '<p>✅ Great news! Your order has been confirmed and is being prepared for shipment.</p>';
    case 'SHIPPED':
      return '<p>🚚 Your order is on its way! You should receive it soon.</p>';
    case 'DELIVERED':
      return '<p>🎉 Your order has been delivered! We hope you enjoy your purchase.</p>';
    case 'CANCELLED':
      return '<p>❌ Your order has been cancelled. If you have any questions, please contact support.</p>';
    default:
      return '<p>Your order status has been updated.</p>';
  }
}

async function sendEmail(
  from: string,
  to: string,
  subject: string,
  htmlBody: string
): Promise<void> {
  const command = new SendEmailCommand({
    Source: from,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
      },
    },
  });

  await sesClient.send(command);
}