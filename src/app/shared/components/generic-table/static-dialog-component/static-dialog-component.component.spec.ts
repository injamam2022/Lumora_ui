import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticDialogComponentComponent } from './static-dialog-component.component';

describe('StaticDialogComponentComponent', () => {
  let component: StaticDialogComponentComponent;
  let fixture: ComponentFixture<StaticDialogComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaticDialogComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaticDialogComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
