export class Validator {

    static isValidUUID(value: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
    }

    static isNotEmpty(value: string): boolean {
        return value !== null && value !== undefined && value.trim().length > 0;
    }

    static isPositiveNumber(value: number): boolean {
        return typeof value === 'number' && value > 0 && !isNaN(value);
    }

    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    static isInRange(value: number, min: number, max: number): boolean {
        return value >= min && value <= max;
    }

    static hasItems<T>(array: T[]): boolean {
        return Array.isArray(array) && array.length > 0;
    }
}