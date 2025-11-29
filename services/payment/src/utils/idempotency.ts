import { APIGatewayProxyEvent } from 'aws-lambda';

import { v4 as uuidv4 } from 'uuid';
import { IdempotencyService } from '../infrastructure/services/IdempotencyService';

export interface IdempotencyResult {
  isIdempotent: boolean;
  existingResponse?: any;
  idempotencyKey: string;
}

/**
 * Check if request is idempotent
 * Returns existing response if found
 */

export async function checkIdempotency(event: APIGatewayProxyEvent,
  userId: string) : Promise<IdempotencyResult>{
    const idempotencyService = new IdempotencyService();
    let idempotencyKey = event.headers['Idempotency-Key'] 
    || event.headers['idempotency-key']
    || event.headers['X-Idempotency-Key']
    || event.headers['x-idempotency-key'];
    // If no key provided, generate one from request body
    if(!idempotencyKey){
        if (event.body) {
            idempotencyKey = IdempotencyService.generateKey(userId, event.body);
            console.log('ℹ️ Generated idempotency key from request body');
        } else {
            // No body, no idempotency key - skip idempotency check
            console.log('ℹ️ No idempotency key and no body - skipping check');
            return {
                isIdempotent: false,
                idempotencyKey: uuidv4(),
            };
        }
    }
    console.log('🔍 Checking idempotency key:', idempotencyKey);
    // Check if this request was already processed
    const existingResponse = await idempotencyService.getExistingResponse(idempotencyKey);
    if (existingResponse) {
        return {
          isIdempotent: true,
          existingResponse,
          idempotencyKey,
        };
    }
    return {
        isIdempotent: false,
        idempotencyKey,
    };
}

/**
 * Store response for idempotency
 */
export async function storeIdempotentResponse(
  idempotencyKey: string,
  response: any
): Promise<void> {
  const idempotencyService = new IdempotencyService();
  await idempotencyService.storeResponse(idempotencyKey, response);
}