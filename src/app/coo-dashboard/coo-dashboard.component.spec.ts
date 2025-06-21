import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CooDashboardComponent } from './coo-dashboard.component';

describe('CooDashboardComponent', () => {
  let component: CooDashboardComponent;
  let fixture: ComponentFixture<CooDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CooDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CooDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
