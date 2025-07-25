import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FixedResourceComponent } from './fixed-resource.component';

describe('FixedResourceComponent', () => {
  let component: FixedResourceComponent;
  let fixture: ComponentFixture<FixedResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixedResourceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixedResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
