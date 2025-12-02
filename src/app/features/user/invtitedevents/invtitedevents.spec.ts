import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Invtitedevents } from './invtitedevents';

describe('Invtitedevents', () => {
  let component: Invtitedevents;
  let fixture: ComponentFixture<Invtitedevents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Invtitedevents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Invtitedevents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
