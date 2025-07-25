import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FixedResourceCreationComponent } from './fixed-resource-creation.component';

describe('FixedResourceCreationComponent', () => {
  let component: FixedResourceCreationComponent;
  let fixture: ComponentFixture<FixedResourceCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixedResourceCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixedResourceCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
