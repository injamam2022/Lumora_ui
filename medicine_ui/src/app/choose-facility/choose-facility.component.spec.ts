import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseFacilityComponent } from './choose-facility.component';

describe('ChooseFacilityComponent', () => {
  let component: ChooseFacilityComponent;
  let fixture: ComponentFixture<ChooseFacilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseFacilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
