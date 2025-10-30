"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
var Validator = /** @class */ (function () {
    function Validator() {
    }
    Validator.isValidUUID = function (value) {
        var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
    };
    Validator.isNotEmpty = function (value) {
        return value !== null && value !== undefined && value.trim().length > 0;
    };
    Validator.isPositiveNumber = function (value) {
        return typeof value === 'number' && value > 0 && !isNaN(value);
    };
    Validator.isValidEmail = function (email) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    Validator.isInRange = function (value, min, max) {
        return value >= min && value <= max;
    };
    Validator.hasItems = function (array) {
        return Array.isArray(array) && array.length > 0;
    };
    return Validator;
}());
exports.Validator = Validator;
