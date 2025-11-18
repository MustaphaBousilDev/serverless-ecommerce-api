import { OrderStatus } from "../entities/Order";


export interface OrderHistoryProps {
    orderId: string;
    timestamp: Date;
    oldStatus?: OrderStatus;
    newStatus: OrderStatus;
    changedBy: string;
    changeType: 'CREATED' | 'STATUS_CHANGED' | 'ITEMS_UPDATED' | 'CANCELLED';
    reason?: string;
    metadata?: Record<string, any>
}

export class OrderHistory {
    private props: OrderHistoryProps;

    constructor(props: OrderHistoryProps) {
        this.props = props;
    }

    static create(
    orderId: string,
    newStatus: OrderStatus,
    changedBy: string,
    changeType: 'CREATED' | 'STATUS_CHANGED' | 'ITEMS_UPDATED' | 'CANCELLED',
    oldStatus?: OrderStatus,
    reason?: string,
    metadata?: Record<string, any>
    ): OrderHistory {
        return new OrderHistory({
        orderId,
        timestamp: new Date(),
        oldStatus,
        newStatus,
        changedBy,
        changeType,
        reason,
        metadata,
        });
    }

    get orderId(): string {
        return this.props.orderId;
    }

    get timestamp(): Date {
        return this.props.timestamp;
    }

    get oldStatus(): OrderStatus | undefined {
        return this.props.oldStatus;
    }

    get newStatus(): OrderStatus {
        return this.props.newStatus;
    }

    get changedBy(): string {
        return this.props.changedBy;
    }

    get changeType(): string {
        return this.props.changeType;
    }

    get reason(): string | undefined {
        return this.props.reason;
    }

    get metadata(): Record<string, any> | undefined {
        return this.props.metadata;
    }

    toObject(): any {
        return {
        orderId: this.props.orderId,
        timestamp: this.props.timestamp.toISOString(),
        oldStatus: this.props.oldStatus,
        newStatus: this.props.newStatus,
        changedBy: this.props.changedBy,
        changeType: this.props.changeType,
        reason: this.props.reason,
        metadata: this.props.metadata,
        };
    }

    static fromObject(data: any): OrderHistory {
        return new OrderHistory({
        orderId: data.orderId,
        timestamp: new Date(data.timestamp),
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
        changedBy: data.changedBy,
        changeType: data.changeType,
        reason: data.reason,
        metadata: data.metadata,
        });
    }
}