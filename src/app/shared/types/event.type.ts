export interface eventType {
    id: number;
    name: string;
    description: string;
    createdBy: number;
    date: Date;
    venue: string;
    time: string;
    isPublic: boolean;
    status:eventStatus;
}

export enum eventStatus {
    Completed,
    Active,
    Cancelled,
    Banned        
}