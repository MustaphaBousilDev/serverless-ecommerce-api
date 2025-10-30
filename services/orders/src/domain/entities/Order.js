"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = exports.OrderStatus = void 0;
var OrderId_1 = require("../value-objects/OrderId");
var OrderItem_1 = require("./OrderItem");
var Address_1 = require("../value-objects/Address");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var Order = /** @class */ (function () {
    function Order(props) {
        this.props = props;
        this.validate();
    }
    // Factory method to create new order
    Order.create = function (userId, items, shippingAddress) {
        var orderId = OrderId_1.OrderId.generate();
        var totalAmount = items.reduce(function (sum, item) { return sum + item.getTotalPrice(); }, 0);
        var now = new Date();
        return new Order({
            orderId: orderId,
            userId: userId,
            items: items,
            shippingAddress: shippingAddress,
            status: OrderStatus.PENDING,
            totalAmount: totalAmount,
            createdAt: now,
            updatedAt: now,
        });
    };
    // Business logic: Validate order
    Order.prototype.validate = function () {
        if (!this.props.userId) {
            throw new Error('User ID is required');
        }
        if (!this.props.items || this.props.items.length === 0) {
            throw new Error('Order must have at least one item');
        }
        if (this.props.totalAmount <= 0) {
            throw new Error('Total amount must be greater than zero');
        }
    };
    // Business logic: Confirm order
    Order.prototype.confirm = function () {
        if (this.props.status !== OrderStatus.PENDING) {
            throw new Error('Only pending orders can be confirmed');
        }
        this.props.status = OrderStatus.CONFIRMED;
        this.props.updatedAt = new Date();
    };
    // Business logic: Cancel order
    Order.prototype.cancel = function () {
        if (this.props.status === OrderStatus.DELIVERED) {
            throw new Error('Cannot cancel delivered orders');
        }
        if (this.props.status === OrderStatus.CANCELLED) {
            throw new Error('Order is already cancelled');
        }
        this.props.status = OrderStatus.CANCELLED;
        this.props.updatedAt = new Date();
    };
    // Business logic: Ship order
    Order.prototype.ship = function () {
        if (this.props.status !== OrderStatus.CONFIRMED && this.props.status !== OrderStatus.PROCESSING) {
            throw new Error('Only confirmed or processing orders can be shipped');
        }
        this.props.status = OrderStatus.SHIPPED;
        this.props.updatedAt = new Date();
    };
    Object.defineProperty(Order.prototype, "orderId", {
        // Getters
        get: function () {
            return this.props.orderId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Order.prototype, "userId", {
        get: function () {
            return this.props.userId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Order.prototype, "items", {
        get: function () {
            return __spreadArray([], this.props.items, true); // Return copy to prevent mutation
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Order.prototype, "shippingAddress", {
        get: function () {
            return this.props.shippingAddress;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Order.prototype, "status", {
        get: function () {
            return this.props.status;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Order.prototype, "totalAmount", {
        get: function () {
            return this.props.totalAmount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Order.prototype, "createdAt", {
        get: function () {
            return this.props.createdAt;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Order.prototype, "updatedAt", {
        get: function () {
            return this.props.updatedAt;
        },
        enumerable: false,
        configurable: true
    });
    // Convert to plain object (for persistence)
    Order.prototype.toObject = function () {
        return {
            orderId: this.props.orderId.value,
            userId: this.props.userId,
            items: this.props.items.map(function (item) { return item.toObject(); }),
            shippingAddress: this.props.shippingAddress.toObject(),
            status: this.props.status,
            totalAmount: this.props.totalAmount,
            createdAt: this.props.createdAt.toISOString(),
            updatedAt: this.props.updatedAt.toISOString(),
        };
    };
    // Reconstruct from plain object (from database)
    Order.fromObject = function (data) {
        return new Order({
            orderId: new OrderId_1.OrderId(data.orderId),
            userId: data.userId,
            items: data.items.map(function (item) { return OrderItem_1.OrderItem.fromObject(item); }),
            shippingAddress: Address_1.Address.fromObject(data.shippingAddress),
            status: data.status,
            totalAmount: data.totalAmount,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
        });
    };
    return Order;
}());
exports.Order = Order;
