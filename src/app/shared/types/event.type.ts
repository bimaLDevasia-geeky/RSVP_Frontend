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
    media: mediaType[];
    inviteCode: string;
    
}
export interface mediaType {
    id: number;
    eventId: number;
    url: string;
    publicId: string;
}
export enum eventStatus {
    Completed,
    Active,
    Cancelled,
    Banned        
}

export interface eventFormType {
    name: string;
    description: string;
    date: Date;
    venue: string;
    time: string;
    isPublic: boolean;
    status:string;
}

export interface CreateEventDto {
    name: string;
    description: string;
    date: string;
    venue: string;
    time: string;
    isPublic: boolean;
    images?: File[];
}

export interface ImageDeleteDto {
    imageId: number;
    publicId: string;
}

export interface UpdateEventDto {
    eventId: number;
    name?: string;
    description?: string;
    date?: string;
    venue?: string;
    time?: string;
    isPublic?: boolean;
    status?: string;
    imagesToDelete?: ImageDeleteDto[];
}

export interface Attendee {
    id: number;
    name: string;
    email: string;
    role:'Guest' | 'Organizer';
    status: 'Attending' | 'Maybe' | 'NotAttending' | 'NoResponse';
    user?: {
        name:string;
    }
}

export interface StatusCountDto {
    attending: number;
    maybe: number;
    notAttending: number;
    noResponse: number;
}

export interface AttendeeResponseDto {
    attendies: Attendee[];
    statusCounts: StatusCountDto;
}

export interface EventDetailDto {
    id: number;
    name: string;
    description: string;
    createdBy: number;
    date: Date;
    venue: string;
    time: string;
    isPublic: boolean;
    status: eventStatus;
    inviteCode: string;
    media: EventImageDto[];
    attendies: Attendee[];
    createdAt: Date;
}

export interface EventImageDto {
    id: number;
    url: string;
    publicId: string;
}

export interface GuestDto {
    id: number;
    name: string;
    email: string;
}

export interface AddGuestDto {
    eventId: number;
    userId: number;
}

export interface InvitedEventDto {
    id: number;
    name: string;
    description: string;
    date: Date;
    venue: string;
    time: string;
    isPublic: boolean;
    inviteCode: string;
    media: EventImageDto[];
    
}