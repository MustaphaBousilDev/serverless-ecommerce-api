export const AWS_CONFIG = {
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.AWS_ENDPOINT,
}

export const TABLE_NAMES = {
    ORDERS: process.env.ORDERS_TABLE_NAME || 'dev-orders',
    PRODUCTS: process.env.PRODUCTS_TABLE_NAME || 'dev-products'
}

export const QUEUE_URLS = {
    ORDER_PROCESSING: process.env.ORDER_QUEUE_URL || '',
}

export const EVENT_BUS = {
    NAME: process.env.EVENT_BUS_NAME || 'dev-order-events',
};

