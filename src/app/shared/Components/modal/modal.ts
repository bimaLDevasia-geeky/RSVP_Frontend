import { Component } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  modalTitle: string = 'Modal Title';

  closeModal(): void {
    this.onContainerClicked
    // Logic to close the modal
  }
  onContainerClicked(event: MouseEvent): void {
    if ((<HTMLElement>event.target).classList.contains('container')) {
      this.closeModal();
    }
  }
}
