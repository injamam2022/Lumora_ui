import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchingRulesComponent } from './branching-rules.component';

describe('BranchingRulesComponent', () => {
  let component: BranchingRulesComponent;
  let fixture: ComponentFixture<BranchingRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchingRulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchingRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
