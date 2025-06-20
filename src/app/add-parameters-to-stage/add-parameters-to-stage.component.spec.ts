import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddParametersToStageComponent } from './add-parameters-to-stage.component';

describe('AddParametersToStageComponent', () => {
  let component: AddParametersToStageComponent;
  let fixture: ComponentFixture<AddParametersToStageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddParametersToStageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddParametersToStageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
