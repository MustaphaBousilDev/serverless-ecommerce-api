"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT_BUS = exports.QUEUE_URLS = exports.TABLE_NAMES = exports.AWS_CONFIG = void 0;
exports.AWS_CONFIG = {
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.AWS_ENDPOINT,
};
exports.TABLE_NAMES = {
    ORDERS: process.env.ORDERS_TABLE_NAME || 'dev-orders',
    PRODUCTS: process.env.PRODUCTS_TABLE_NAME || 'dev-products'
};
exports.QUEUE_URLS = {
    ORDER_PROCESSING: process.env.ORDER_QUEUE_URL || '',
};
exports.EVENT_BUS = {
    NAME: process.env.EVENT_BUS_NAME || 'dev-order-events',
};
