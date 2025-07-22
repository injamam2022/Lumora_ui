import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeFormsEntryComponent } from './make-forms-entry.component';

describe('MakeFormsEntryComponent', () => {
  let component: MakeFormsEntryComponent;
  let fixture: ComponentFixture<MakeFormsEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MakeFormsEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MakeFormsEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
