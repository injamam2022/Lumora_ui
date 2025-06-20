import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageProcessComponent } from './manage-process.component';

describe('ManageProcessComponent', () => {
  let component: ManageProcessComponent;
  let fixture: ComponentFixture<ManageProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageProcessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
