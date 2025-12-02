import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvitedeventsDetailComponent } from './invitedevents-detail';

describe('InvitedeventsDetailComponent', () => {
  let component: InvitedeventsDetailComponent;
  let fixture: ComponentFixture<InvitedeventsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitedeventsDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitedeventsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
