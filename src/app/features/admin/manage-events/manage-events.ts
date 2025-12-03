import { Component, signal } from '@angular/core';
import { AdminService } from '../../../shared/services/admin.service';
import { DatePipe } from '@angular/common';
import { ModalComponent } from '../../../shared/Components/modal/modal';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manage-events',
  imports: [DatePipe, ModalComponent, FormsModule],
  templateUrl: './manage-events.html',
  styleUrl: './manage-events.scss',
})
export class ManageEvents {

  constructor(private adminService:AdminService) {}

  AllEvents:any[] = [];
  showModal = signal(false);
  selectedEventId = signal<number | null>(null);
  selectedEventName = signal<string>('');
  selectedStatus = signal<string>('Active');
  
  statusOptions = ['Active', 'Completed', 'Cancelled', 'Banned'];

  ngOnInit(): void {
    this.adminService.getAllEvents().subscribe({
      next:(events:any[])=>{
        this.AllEvents = events;
        console.log(this.AllEvents);
      },
      error:(error:unknown)=>{
        console.error('Error fetching events:', error);
      }
    });
  }

  openStatusModal(eventId: number, eventName: string, currentStatus: string): void {
    this.selectedEventId.set(eventId);
    this.selectedEventName.set(eventName);
    this.selectedStatus.set(currentStatus || 'Active');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedEventId.set(null);
    this.selectedEventName.set('');
  }

  confirmStatusUpdate(): void {
    const eventId = this.selectedEventId();
    const status = this.selectedStatus();
    
    if (eventId !== null) {
      this.updateEventStatus(eventId, status);
      this.closeModal();
    }
  }

  updateEventStatus(eventId:number,status:string):void{
    this.adminService.updateEventStatus(eventId,status).subscribe({
      next:()=>{
        console.log("event status updated");
        this.ngOnInit();
      },
      error:(error:unknown)=>{
        console.error('Error updating event status:', error);
      }
    });
  }
}