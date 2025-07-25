import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { AddRoomPayload } from '../interface/room.interface';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RoomService } from '../services/room.service';
import { ToasterService } from '../../shared/services/toaster.service';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-room-creation',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule, MultiSelectModule],
  templateUrl: './room-creation.component.html',
  styleUrl: './room-creation.component.scss',
})
export class RoomCreationComponent {
  public addRoomPayload: AddRoomPayload = {
    roomName: '',
    roomType: '',
    sectionAreaId: ''
  };

  fixedResources: any[] = [];
  selectedResourceIds: number[] = [];

  public constructor(
    private readonly config: DynamicDialogConfig,
    public roomService: RoomService,
    public toasterService: ToasterService,
    private readonly ref: DynamicDialogRef
  ) {}

  ngOnInit() {
    this.roomService.getFixedResources().subscribe((resources) => {
      this.fixedResources = resources;
      console.log('Fixed Resources:', this.fixedResources); // Debug
    });
    if (this.config.data.purpose === 'edit') {
      this.roomService
        .getSingleRoom(this.config.data.id)
        .subscribe((responseData) => {
          const room = responseData.all_list[0];
          this.addRoomPayload.roomName = room.room_name;
          this.addRoomPayload.roomType = room.room_type;
          this.addRoomPayload.sectionAreaId = room.section_area_id;
          // Optionally: fetch and set selectedResourceIds if editing
        });
    }
  }

  public addCreation() {
    const payload = {
      room_name: this.addRoomPayload.roomName,
      room_type: this.addRoomPayload.roomType,
      section_area_id: this.addRoomPayload.sectionAreaId
    };
    if (this.config.data.purpose === 'edit') {
      this.roomService
        .updateRoom(payload, this.config.data.id)
        .subscribe((response) => {
          this.toasterService.successToast('Room Updated');
          this.roomService.refreshTableData(true);
        });
      this.ref.close();
    } else if (this.config.data.purpose === 'add') {
      this.roomService
        .addRoomWithResources(payload, this.selectedResourceIds)
        .subscribe((response) => {
          this.toasterService.successToast('Room Added');
          this.roomService.refreshTableData(true);
        });
      this.ref.close();
    }
  }
}
