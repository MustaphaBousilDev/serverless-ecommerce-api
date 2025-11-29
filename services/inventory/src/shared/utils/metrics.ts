import { CloudWatchClient, PutMetricDataCommand, StandardUnit } from '@aws-sdk/client-cloudwatch';

const cloudwatch = new CloudWatchClient({
    region: process.env.AWS_REGION
})

export enum MetricName {
    ORDER_CREATED = 'OrderCreated',
    ORDER_CANCELLED = 'OrderCancelled',
    ORDER_VALUE = 'OrderValue',
    ORDER_ITEMS_COUNT = 'OrderItemsCount',
    VALIDATION_ERROR = 'ValidationError',
    DATABASE_ERROR = 'DatabaseError',
}

export class MetricsPublisher {
    private namespace: string

    constructor(namespace: string = 'OrdersService'){
       this.namespace = namespace;
    }

    async publishCount(metricName: MetricName, value: number = 1, dimensions?: Record<string, string>){
        const metricData = {
            MetricName: metricName,
            Value: value,
            Unit: StandardUnit.Count,
            Timestamp: new Date(),
            Dimensions: dimensions ? Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value })) : [],
        }

        try {
            await cloudwatch.send(new PutMetricDataCommand({
                Namespace: this.namespace,
                MetricData: [metricData],
            }))
        } catch(error) {
            console.error('Failed to publish metric:', error)
            // Don't throw - metrics shouldn't break the app
        }
    }

    async publishValue(metricName: MetricName, value: number, unit: StandardUnit = StandardUnit.None, dimensions?: Record<string, string>) {
        const metricData = {
            MetricName: metricName,
            Value: value,
            Unit: unit,
            Timestamp: new Date(),
            Dimensions: dimensions ? Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value })) : [],
        };
        try {
            await cloudwatch.send(new PutMetricDataCommand({
                Namespace: this.namespace,
                MetricData: [metricData],
            }));
        } catch(error) {
            console.error('Failed to publish metric:', error);
        }
    }


    async publishOrderCreated(totalAmount: number, itemCount: number, userId: string) {
        await Promise.all([
        this.publishCount(MetricName.ORDER_CREATED),
        this.publishValue(MetricName.ORDER_VALUE, totalAmount, 'None', { UserId: userId }),
        this.publishValue(MetricName.ORDER_ITEMS_COUNT, itemCount, 'Count'),
        ]);
    }

    async publishOrderCancelled(userId: string) {
        await this.publishCount(MetricName.ORDER_CANCELLED, 1, { UserId: userId });
    }

    async publishError(errorType: MetricName, errorCode: string) {
        await this.publishCount(errorType, 1, { ErrorCode: errorCode });
    }
}

