import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortableResourceCreationComponent } from './portable-resource-creation.component';

describe('PortableResourceCreationComponent', () => {
  let component: PortableResourceCreationComponent;
  let fixture: ComponentFixture<PortableResourceCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortableResourceCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortableResourceCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 