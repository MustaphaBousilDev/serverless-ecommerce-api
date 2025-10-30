"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
var Money = /** @class */ (function () {
    function Money(amount, currency) {
        if (currency === void 0) { currency = 'USD'; }
        if (amount < 0) {
            throw new Error('Amount cannot be negative');
        }
        this._amount = amount;
        this._currency = currency;
    }
    Object.defineProperty(Money.prototype, "amount", {
        get: function () {
            return this._amount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Money.prototype, "currency", {
        get: function () {
            return this._currency;
        },
        enumerable: false,
        configurable: true
    });
    Money.prototype.add = function (other) {
        if (this._currency !== other._currency) {
            throw new Error('Cannot add money with different currencies');
        }
        return new Money(this._amount + other._amount, this._currency);
    };
    Money.prototype.multiply = function (factor) {
        return new Money(this._amount * factor, this._currency);
    };
    Money.prototype.toObject = function () {
        return {
            amount: this._amount,
            currency: this._currency,
        };
    };
    Money.fromObject = function (data) {
        return new Money(data.amount, data.currency);
    };
    return Money;
}());
exports.Money = Money;
