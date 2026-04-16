export interface Subscription {
    id: number;
    userId: number;
    planType: string;
    nodeCount: number;
    validationCode: string;
    active: boolean;
}