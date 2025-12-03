import { Component, signal } from '@angular/core';
import { AdminService } from '../../../shared/services/admin.service';
import { ModalComponent } from '../../../shared/Components/modal/modal';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-manage-users',
  imports: [ModalComponent],
  templateUrl: './manage-users.html',
  styleUrl: './manage-users.scss',
})
export class ManageUsers {

  constructor(private adminService: AdminService,private toastService: HotToastService) {}

  AllUsers:any[] = [];
  showModal = signal(false);
  selectedUserId = signal<number | null>(null);
  selectedUserName = signal<string>('');
  actionType = signal<'delete' | 'ban' | 'unban'>('delete');

  ngOnInit(): void {
    this.adminService.getUsers().subscribe({
      next:(users:any[])=>{
        this.AllUsers = users;
        console.log(this.AllUsers);
        
      },
      error:(error:unknown)=>{
        console.error('Error fetching users:', error);
      }
    });
  }

  openConfirmationModal(userId: number, userName: string, action: 'delete' | 'ban' | 'unban'): void {
    this.selectedUserId.set(userId);
    this.selectedUserName.set(userName);
    this.actionType.set(action);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedUserId.set(null);
    this.selectedUserName.set('');
  }

  confirmAction(): void {
    const userId = this.selectedUserId();
    const action = this.actionType();
    
    if (userId !== null) {
      let status = 'Deleted';
      if (action === 'ban') status = 'Banned';
      if (action === 'unban') status = 'Active';
      
      this.UpdateStatus(userId, status);
      this.closeModal();
    }
  }

  UpdateStatus(userId:number,status:string):void{
    this.adminService.updateUserStatus(userId,status).subscribe({
      next:()=>{
        console.log("user status updated");
        this.toastService.success('User status updated');

        
        this.ngOnInit();
      },
      error:(error:unknown)=>{
        console.error('Error updating user status:', error);
      }
    });
  }
}
