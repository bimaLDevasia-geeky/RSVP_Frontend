import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MyeventsService } from '../../services/myevents.service';
import { EventDetailDto, EventImageDto, ImageDeleteDto } from '../../../../../shared/types/event.type';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-editevent',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editevent.html',
  styleUrl: './editevent.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Editevent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private myeventsService = inject(MyeventsService);
  private toast = inject(HotToastService);

  eventForm!: FormGroup;
  eventId: number | null = null;
  isLoading = signal(true);
  isSubmitting = signal(false);

  // Existing images from backend
  existingImages = signal<EventImageDto[]>([]);
  imagesToDelete = signal<ImageDeleteDto[]>([]);

  // New images to upload
  newImagePreviews = signal<{ file: File; preview: string }[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId = +id;
      this.initializeForm();
      this.loadEventData(this.eventId);
    } else {
      this.router.navigate(['/myevents']);
    }
  }

  initializeForm(): void {
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      venue: ['', Validators.required],
      isPublic: [true],
      status: ['Active', Validators.required]
    });
  }

  loadEventData(eventId: number): void {
    this.myeventsService.getEventDetail(eventId).subscribe({
      next: (event: EventDetailDto) => {
        this.populateForm(event);
        this.existingImages.set(event.media);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading event:', error);
        this.toast.error('Failed to load event');
        this.router.navigate(['/myevents']);
      }
    });
  }

  populateForm(event: EventDetailDto): void {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toISOString().split('T')[0];

    this.eventForm.patchValue({
      name: event.name,
      description: event.description,
      date: formattedDate,
      time: event.time,
      venue: event.venue,
      isPublic: event.isPublic,
      status: event.status
    });
  }

  onNewImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const filesArray = Array.from(input.files);
      const currentPreviews = this.newImagePreviews();

      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            this.newImagePreviews.set([
              ...this.newImagePreviews(),
              { file, preview: e.target.result as string }
            ]);
          }
        };
        reader.readAsDataURL(file);
      });

      input.value = '';
    }
  }

  removeNewImage(index: number): void {
    this.newImagePreviews.set(
      this.newImagePreviews().filter((_, i) => i !== index)
    );
  }

  markExistingImageForDeletion(image: EventImageDto): void {
    const deleteDto: ImageDeleteDto = {
      imageId: image.id,
      publicId: image.publicId
    };
    this.imagesToDelete.set([...this.imagesToDelete(), deleteDto]);
    this.existingImages.set(
      this.existingImages().filter(img => img.id !== image.id)
    );
  }

  onSubmit(): void {
    if (this.eventForm.invalid || !this.eventId) {
      this.toast.error('Please fill all required fields');
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.eventForm.value;

    const updateDto = {
      eventId: this.eventId,
      name: formValue.name,
      description: formValue.description,
      date: formValue.date,
      time: formValue.time,
      venue: formValue.venue,
      isPublic: formValue.isPublic,
      status: formValue.status,
      imagesToDelete: this.imagesToDelete().length > 0 ? this.imagesToDelete() : undefined
    };

    const newImages = this.newImagePreviews().map(preview => preview.file);

    this.myeventsService.updateEvent(updateDto, newImages.length > 0 ? newImages : undefined).subscribe({
      next: () => {
        this.toast.success('Event updated successfully');
        this.router.navigate(['/myevents', this.eventId]);
      },
      error: (error) => {
        console.error('Error updating event:', error);
        this.toast.error('Failed to update event');
        this.isSubmitting.set(false);
      }
    });
  }

  cancel(): void {
    if (this.eventId) {
      this.router.navigate(['/myevents', this.eventId]);
    } else {
      this.router.navigate(['/myevents']);
    }
  }
}
