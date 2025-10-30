"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = void 0;
var OrderItem = /** @class */ (function () {
    function OrderItem(props) {
        this.props = props;
        this.validate();
    }
    OrderItem.prototype.validate = function () {
        if (!this.props.productId) {
            throw new Error('Product ID is required');
        }
        if (!this.props.productName) {
            throw new Error('Product name is required');
        }
        if (this.props.quantity <= 0) {
            throw new Error('Quantity must be greater than zero');
        }
        if (this.props.unitPrice <= 0) {
            throw new Error('Unit price must be greater than zero');
        }
    };
    OrderItem.prototype.getTotalPrice = function () {
        return this.props.quantity * this.props.unitPrice;
    };
    Object.defineProperty(OrderItem.prototype, "productId", {
        // Getters
        get: function () {
            return this.props.productId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OrderItem.prototype, "productName", {
        get: function () {
            return this.props.productName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OrderItem.prototype, "quantity", {
        get: function () {
            return this.props.quantity;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OrderItem.prototype, "unitPrice", {
        get: function () {
            return this.props.unitPrice;
        },
        enumerable: false,
        configurable: true
    });
    OrderItem.prototype.toObject = function () {
        return {
            productId: this.props.productId,
            productName: this.props.productName,
            quantity: this.props.quantity,
            unitPrice: this.props.unitPrice,
        };
    };
    OrderItem.fromObject = function (data) {
        return new OrderItem({
            productId: data.productId,
            productName: data.productName,
            quantity: data.quantity,
            unitPrice: data.unitPrice,
        });
    };
    return OrderItem;
}());
exports.OrderItem = OrderItem;
