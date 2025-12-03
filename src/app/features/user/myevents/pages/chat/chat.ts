import { Component, DestroyRef, inject, input, signal, effect, viewChild, ElementRef } from '@angular/core';
import { ChatService } from '../../services/chat.services';
import { ChatMessage } from '../../../../../shared/types/chatMessageType';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HotToastService } from '@ngxpert/hot-toast';
import { AuthService } from '../../../../../core/auth/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  imports: [CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss'
})
export class Chat {

  chatService=inject(ChatService);  
  authService=inject(AuthService);
  ref = inject(DestroyRef)
  toast = inject(HotToastService);

  eventId=input<number>(); 

  messages= signal<ChatMessage[]>([]);
  isLoading=signal<boolean>(false);
  newMessage = signal<string>('');
  userId= signal<number>(0);
  isOpen= signal<boolean>(false);
  isConnected = signal<boolean>(false);
  
  messagesContainer = viewChild<ElementRef>('messagesContainer');

  constructor() {
    // Get user ID
    this.authService.currentUser$.pipe(takeUntilDestroyed(this.ref)).subscribe(user=>{
      if(user){
        this.userId.set(user.id);
      }
    });

    // Connect/disconnect based on isOpen state
    effect(() => {
      if (this.isOpen() && !this.isConnected()) {
        this.connectToChat();
      } else if (!this.isOpen() && this.isConnected()) {
        this.disconnectFromChat();
      }
    });

    // Scroll to bottom when messages change
    effect(() => {
      const msgs = this.messages();
      if (msgs.length > 0) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  async connectToChat(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.chatService.startConnection(this.eventId()!);
      this.chatService.messages$.pipe(takeUntilDestroyed(this.ref)).subscribe((msgs: ChatMessage[]) => {
        this.messages.set(msgs);
      });
      this.isConnected.set(true);
    } catch (error) {
      console.error('Failed to start chat connection:', error);
      this.toast.error('Failed to connect to chat');
    } finally {
      this.isLoading.set(false);
    }
  }

  async disconnectFromChat(): Promise<void> {
    if (this.isConnected() && this.eventId()) {
      try {
        await this.chatService.leaveEventChat(this.eventId()!);
        await this.chatService.stopConnection();
        this.isConnected.set(false);
      } catch (error) {
        console.error('Error disconnecting from chat:', error);
        this.isConnected.set(false);
      }
    }
  }

  ngOnDestroy(): void {
    this.disconnectFromChat();
  }

  toggleChat(): void {
    this.isOpen.set(!this.isOpen());
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  async sendMessage(): Promise<void> {
    const messageText = this.newMessage().trim();
    if (!messageText) {
      return;
    }

    if (!this.eventId()) {
      this.toast.error('Event ID is missing');
      return;
    }

    try {
      await this.chatService.sendMessage(this.eventId()!, messageText);
      this.newMessage.set('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error?.message || 'Failed to send message';
      this.toast.error(`Error: ${errorMessage}`);
    }
  }

  isOwnMessage(message: ChatMessage): boolean {
    return message.userId === this.userId();
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    const container = this.messagesContainer();
    if (container) {
      const element = container.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
