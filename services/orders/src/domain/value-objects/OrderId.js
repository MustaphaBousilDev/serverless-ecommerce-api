"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderId = void 0;
var uuid_1 = require("uuid");
var OrderId = /** @class */ (function () {
    function OrderId(value) {
        if (!value || value.trim() === '') {
            throw new Error('OrderId cannot be empty');
        }
        this._value = value;
    }
    OrderId.generate = function () {
        return new OrderId((0, uuid_1.v4)());
    };
    Object.defineProperty(OrderId.prototype, "value", {
        get: function () {
            return this._value;
        },
        enumerable: false,
        configurable: true
    });
    OrderId.prototype.equals = function (other) {
        return this._value === other._value;
    };
    OrderId.prototype.toString = function () {
        return this._value;
    };
    return OrderId;
}());
exports.OrderId = OrderId;
