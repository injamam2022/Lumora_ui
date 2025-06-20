import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationalControlTowerComponent } from './operational-control-tower.component';

describe('OperationalControlTowerComponent', () => {
  let component: OperationalControlTowerComponent;
  let fixture: ComponentFixture<OperationalControlTowerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationalControlTowerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationalControlTowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
