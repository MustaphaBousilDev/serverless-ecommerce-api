"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFromEvent = getUserFromEvent;
exports.requireAuth = requireAuth;
const DomainErrors_1 = require("../../domain/errors/DomainErrors");
function getUserFromEvent(event) {
    try {
        const claims = event.requestContext.authorizer?.claims;
        if (!claims) {
            console.warn('No claims found in request context');
            return null;
        }
        const email = claims.email || claims['cognito:username'];
        const sub = claims.sub;
        if (!email || !sub) {
            console.warn('Missing required claims (email or sub)');
            return null;
        }
        return {
            email,
            sub,
            name: claims.name,
        };
    }
    catch (error) {
        console.error('Error extracting user from token:', error);
        return null;
    }
}
function requireAuth(event) {
    const user = getUserFromEvent(event);
    if (!user) {
        throw new DomainErrors_1.UnauthorizedError('Missing authorization token');
    }
    return user;
}
