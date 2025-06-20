import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignToRoleComponent } from './assign-to-role.component';

describe('AssignToRoleComponent', () => {
  let component: AssignToRoleComponent;
  let fixture: ComponentFixture<AssignToRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignToRoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignToRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
