import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortableResourceComponent } from './portable-resource.component';

describe('PortableResourceComponent', () => {
  let component: PortableResourceComponent;
  let fixture: ComponentFixture<PortableResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortableResourceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortableResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 