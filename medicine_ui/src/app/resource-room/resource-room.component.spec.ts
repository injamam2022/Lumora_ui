import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceRoomComponent } from './resource-room.component';

describe('ResourceRoomComponent', () => {
  let component: ResourceRoomComponent;
  let fixture: ComponentFixture<ResourceRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
