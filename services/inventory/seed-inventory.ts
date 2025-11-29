import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const products = [
  { productId: 'prod-001', productName: 'Laptop', availableQuantity: 10, reservedQuantity: 0 },
  { productId: 'prod-002', productName: 'Mouse', availableQuantity: 50, reservedQuantity: 0 },
  { productId: 'prod-003', productName: 'Keyboard', availableQuantity: 30, reservedQuantity: 0 },
  { productId: 'prod-004', productName: 'Monitor', availableQuantity: 15, reservedQuantity: 0 },
  { productId: 'prod-005', productName: 'Headphones', availableQuantity: 25, reservedQuantity: 0 },
];

async function seedInventory() {
  console.log('🌱 Seeding inventory data...\n');

  for (const product of products) {
    const command = new PutCommand({
      TableName: 'dev-inventory',
      Item: {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });

    try {
      await docClient.send(command);
      console.log(`✅ Added: ${product.productName} (${product.availableQuantity} available)`);
    } catch (error) {
      console.error(`❌ Failed to add ${product.productName}:`, error);
    }
  }

  console.log('\n✅ Inventory seeding complete!');
}

seedInventory();
