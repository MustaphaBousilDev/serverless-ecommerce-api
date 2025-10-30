"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
var Address = /** @class */ (function () {
    function Address(props) {
        this.props = props;
        this.validate();
    }
    Address.prototype.validate = function () {
        if (!this.props.street || this.props.street.trim() === '') {
            throw new Error('Street is required');
        }
        if (!this.props.city || this.props.city.trim() === '') {
            throw new Error('City is required');
        }
        if (!this.props.country || this.props.country.trim() === '') {
            throw new Error('Country is required');
        }
        if (!this.props.zipCode || this.props.zipCode.trim() === '') {
            throw new Error('Zip code is required');
        }
    };
    Object.defineProperty(Address.prototype, "street", {
        get: function () {
            return this.props.street;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Address.prototype, "city", {
        get: function () {
            return this.props.city;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Address.prototype, "state", {
        get: function () {
            return this.props.state;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Address.prototype, "country", {
        get: function () {
            return this.props.country;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Address.prototype, "zipCode", {
        get: function () {
            return this.props.zipCode;
        },
        enumerable: false,
        configurable: true
    });
    Address.prototype.toObject = function () {
        return {
            street: this.props.street,
            city: this.props.city,
            state: this.props.state,
            country: this.props.country,
            zipCode: this.props.zipCode,
        };
    };
    Address.fromObject = function (data) {
        return new Address({
            street: data.street,
            city: data.city,
            state: data.state,
            country: data.country,
            zipCode: data.zipCode,
        });
    };
    Address.prototype.toString = function () {
        return "".concat(this.props.street, ", ").concat(this.props.city, ", ").concat(this.props.state, " ").concat(this.props.zipCode, ", ").concat(this.props.country);
    };
    return Address;
}());
exports.Address = Address;
