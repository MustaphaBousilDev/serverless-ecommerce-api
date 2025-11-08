export const successResponse = (statusCode: number, data: any) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
        success: true,
        data,
    })
})

export const errorResponse = (statusCode: number, message: string, error?: any) => ({
    statusCode, 
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
        success: false,
        message,
        error: error?.message || error,
    })
})