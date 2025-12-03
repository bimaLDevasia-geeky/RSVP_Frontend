import { Injectable } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import * as signalR from "@microsoft/signalr";
import { BehaviorSubject } from "rxjs";
import { ChatMessage } from "../../../../shared/types/chatMessageType";

@Injectable({
    providedIn: 'root'
})
export class ChatService {

  api = `${environment.signalRHubUrl}/chatHub`;
  private hubConnection: signalR.HubConnection | null = null;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();


  public async startConnection(eventId: number): Promise<void> {
    const token = localStorage.getItem('token');
    
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.api, {
        accessTokenFactory: () => localStorage.getItem('token') || '',
        withCredentials: false
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await this.hubConnection.start();
      console.log('SignalR connection started successfully');
      console.log('Connection state:', this.hubConnection.state);
      this.registerMessageHandlers();
      await this.joinEventChat(eventId);
    } catch (err) {
      console.error('Error starting SignalR connection: ', err);
      throw err;
    }
  }

  private registerMessageHandlers(): void {
    if (!this.hubConnection) return;

    // Receive new message
    this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
      console.log('Received message:', message);
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, message]);
    });

    // Receive chat history when joining
    this.hubConnection.on('ReceiveChatHistory', (messages: ChatMessage[]) => {
      console.log('Received chat history:', messages);
      this.messagesSubject.next(messages);
    });

    // Handle errors from server
    this.hubConnection.on('Error', (error: string) => {
      console.error('Server error:', error);
    });
  }      public async joinEventChat(eventId: number): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        console.log('Joining event chat:', eventId);
        await this.hubConnection.invoke('JoinEventChat', eventId);
        console.log('Successfully joined event chat:', eventId);
      } catch (err: any) {
        console.error('Error joining event chat: ', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack
        });
        throw err;
      }
    } else {
      console.error('Cannot join chat - connection state:', this.hubConnection?.state);
    }
  }

  public async leaveEventChat(eventId: number): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        console.log('Leaving event chat:', eventId);
        await this.hubConnection.invoke('LeaveEventChat', eventId);
        console.log('Successfully left event chat:', eventId);
      } catch (err: any) {
        // Ignore errors if connection is already closed
        if (err.message?.includes('connection being closed')) {
          console.log('Connection already closed, skipping leave event chat');
        } else {
          console.error('Error leaving event chat: ', err);
        }
      }
    }
  }

  public async sendMessage(eventId: number, message: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      try {
        console.log('Sending message:', { eventId, message });
        await this.hubConnection.invoke('SendMessage', eventId, message);
        console.log('Message sent successfully');
      } catch (err: any) {
        console.error('Error sending message: ', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          eventId,
          messageLength: message.length
        });
        throw err;
      }
    } else {
      const error = `Cannot send message - connection state: ${this.hubConnection?.state}`;
      console.error(error);
      throw new Error(error);
    }
  }
   public async stopConnection(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
      try {
        await this.hubConnection.stop();
        console.log('SignalR connection stopped');
      } catch (err) {
        console.error('Error stopping connection: ', err);
      }
    }
    this.hubConnection = null;
    this.messagesSubject.next([]);
  }
}