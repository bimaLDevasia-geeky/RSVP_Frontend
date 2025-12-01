export interface UserData {
  id: number;
  name: string;
  email: string;

  createdEvents: Event[];
  invitedEvents: Event[];
  organizedEvents: Event[];

  notifications: Notification[];
}

export interface Notification {
  id: number;
  description: string;
  createdAt: string;        
  route: string;        
  
  
}


export interface Event {
  id: number;
  name: string;
  description: string;
  date: string;      
  venue: string;
  time: string;   
  isPublic: boolean;
  status: string;   
  attendieId: number;
  myRole: 'Organizer' | 'Guest' | 'Owner' ;
  myResponseStatus: 'Attending' | 'NotAttending' | 'Maybe' | 'NoResponse' | null;
}
