"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamoDBClient = exports.dynamoDBDocumentClient = void 0;
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
var aws_config_1 = require("./aws-config");
//create DynamoDB Client
var client = new client_dynamodb_1.DynamoDBClient(__assign({ region: aws_config_1.AWS_CONFIG.region }, (aws_config_1.AWS_CONFIG.endpoint) && { endpoint: aws_config_1.AWS_CONFIG.endpoint } // For local testing
));
exports.dynamoDBClient = client;
exports.dynamoDBDocumentClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true, //remove undefined value
        convertClassInstanceToMap: true, // Covert class instances to maps
    },
    unmarshallOptions: {
        wrapNumbers: false, // don't wrap numbers in { N: "123" } format
    }
});
