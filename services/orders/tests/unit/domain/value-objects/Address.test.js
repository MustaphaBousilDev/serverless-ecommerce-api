"use strict";
// tests/unit/domain/value-objects/Address.test.ts
Object.defineProperty(exports, "__esModule", { value: true });
const Address_1 = require("../../../../src/domain/value-objects/Address");
describe('Address Value Object', () => {
    const validAddressData = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
    };
    describe('Address Creation', () => {
        test('should create address with valid data', () => {
            const address = new Address_1.Address(validAddressData);
            expect(address.street).toBe('123 Main St');
            expect(address.city).toBe('New York');
            expect(address.state).toBe('NY');
            expect(address.country).toBe('USA');
            expect(address.zipCode).toBe('10001');
        });
        test('should throw error when street is empty', () => {
            expect(() => {
                new Address_1.Address({ ...validAddressData, street: '' });
            }).toThrow('Street is required');
        });
        test('should throw error when city is empty', () => {
            expect(() => {
                new Address_1.Address({ ...validAddressData, city: '' });
            }).toThrow('City is required');
        });
        test('should throw error when country is empty', () => {
            expect(() => {
                new Address_1.Address({ ...validAddressData, country: '' });
            }).toThrow('Country is required');
        });
        test('should throw error when zipCode is empty', () => {
            expect(() => {
                new Address_1.Address({ ...validAddressData, zipCode: '' });
            }).toThrow('Zip code is required');
        });
        test('should throw error when street is only whitespace', () => {
            expect(() => {
                new Address_1.Address({ ...validAddressData, street: '   ' });
            }).toThrow('Street is required');
        });
    });
    describe('Address Serialization', () => {
        test('should convert to plain object', () => {
            const address = new Address_1.Address(validAddressData);
            const obj = address.toObject();
            expect(obj).toEqual(validAddressData);
        });
        test('should reconstruct from plain object', () => {
            const address = Address_1.Address.fromObject(validAddressData);
            expect(address.street).toBe('123 Main St');
            expect(address.city).toBe('New York');
            expect(address.state).toBe('NY');
            expect(address.country).toBe('USA');
            expect(address.zipCode).toBe('10001');
        });
    });
    describe('Address String Representation', () => {
        test('should convert to formatted string', () => {
            const address = new Address_1.Address(validAddressData);
            const addressString = address.toString();
            expect(addressString).toBe('123 Main St, New York, NY 10001, USA');
        });
    });
});
