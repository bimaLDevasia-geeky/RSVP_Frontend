import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { eventFormType, CreateEventDto } from '../../../../../shared/types/event.type';
import { MyeventsService } from '../../services/myevents.service';
import { HotToastService } from '@ngxpert/hot-toast';

interface ImagePreview {
  file: File;
  url: string;
  id: string;
}

@Component({
  selector: 'app-addevent',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './addevent.html',
  styleUrl: './addevent.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Addevent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private myeventsService = inject(MyeventsService);
  private toast = inject(HotToastService);

  imagePreviews = signal<ImagePreview[]>([]);
  isSubmitting = signal<boolean>(false);

  eventForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required],
    venue: ['', Validators.required],
    isPublic: [false],
    status: ['Active', Validators.required]
  });

  canPreview = computed(() => {
    return this.eventForm.valid;
  });

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      
      files.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const newImage: ImagePreview = {
            file: file,
            url: e.target?.result as string,
            id: Math.random().toString(36).substring(7)
          };
          this.imagePreviews.update(images => [...images, newImage]);
        };
        
        reader.readAsDataURL(file);
      });
      
      // Reset input
      input.value = '';
    }
  }

  removeImage(id: string): void {
    this.imagePreviews.update(images => images.filter(img => img.id !== id));
  }

  // Preview removed - submit creates event and navigates to event detail page

  onSubmit(): void {
    if (this.eventForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      
      const formValue = this.eventForm.value;
      const images = this.imagePreviews().map(img => img.file);
      
      // Create DTO matching backend CreateEventCommand
      const createEventDto: CreateEventDto = {
        name: formValue.name,
        description: formValue.description,
        date: formValue.date, // Backend expects string format
        venue: formValue.venue,
        time: formValue.time, // Backend expects string format for TimeOnly
        isPublic: formValue.isPublic
      };

      this.myeventsService.createEvent(createEventDto, images).subscribe({
        next: (eventId: number) => {
          this.toast.success('Event created successfully!');
          this.isSubmitting.set(false);
          this.router.navigate(['/myevents', eventId]);
        },
        error: (error) => {
          console.error('Error creating event:', error);
          this.toast.error('Failed to create event. Please try again.');
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
