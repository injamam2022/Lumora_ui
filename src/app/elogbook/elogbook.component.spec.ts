import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElogbookComponent } from './elogbook.component';

describe('ElogbookComponent', () => {
  let component: ElogbookComponent;
  let fixture: ComponentFixture<ElogbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElogbookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElogbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
