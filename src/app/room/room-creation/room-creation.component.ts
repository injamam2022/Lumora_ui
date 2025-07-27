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
    console.log('Room Creation Component initialized');
    this.roomService.getFixedResources().subscribe({
      next: (resources) => {
        console.log('Fixed Resources API Response:', resources);
        this.fixedResources = resources;
        console.log('Fixed Resources Array:', this.fixedResources);
      },
      error: (error) => {
        console.error('Error fetching fixed resources:', error);
      }
    });
    if (this.config.data.purpose === 'edit') {
      this.roomService
        .getSingleRoom(this.config.data.id)
        .subscribe((responseData) => {
          const room = responseData.all_list[0];
          this.addRoomPayload.roomName = room.room_name;
          this.addRoomPayload.roomType = room.room_type;
          this.addRoomPayload.sectionAreaId = room.section_area_id;

          // Fetch the room with assigned resources to get the currently assigned resources
          this.roomService.getAllRoomWithResources().subscribe({
            next: (roomsResponse) => {
              const roomWithResources = roomsResponse.all_list.find((r: any) => r.room_id == this.config.data.id);
              if (roomWithResources && roomWithResources.assigned_resources) {
                // Parse the assigned resources string and find the corresponding resource IDs
                const assignedResourceNames = roomWithResources.assigned_resources.split(', ');
                this.selectedResourceIds = this.fixedResources
                  .filter(resource => assignedResourceNames.includes(resource.resource_name))
                  .map(resource => resource.resource_id);
                console.log('Currently assigned resource IDs:', this.selectedResourceIds);
              }
            },
            error: (error) => {
              console.error('Error fetching room with resources:', error);
            }
          });
        });
    }
  }

  public addCreation() {
    const payload = {
      room_name: this.addRoomPayload.roomName,
      room_type: this.addRoomPayload.roomType,
      section_area_id: this.addRoomPayload.sectionAreaId,
    };

    if (this.config.data.purpose === 'add') {
      this.roomService.addRoomWithResources(payload, this.selectedResourceIds).subscribe((response: any) => {
        if (response.stat === 200) {
          this.toasterService.successToast('Room Added Successfully');
          this.roomService.refreshTableData(true);
          this.ref.close();
        } else {
          this.toasterService.errorToast(response.msg);
        }
      });
    } else if (this.config.data.purpose === 'edit') {
      this.roomService.updateRoomWithResources(payload, this.config.data.id, this.selectedResourceIds).subscribe((response: any) => {
        if (response.stat === 200) {
          this.toasterService.successToast('Room Updated Successfully');
          this.roomService.refreshTableData(true);
          this.ref.close();
        } else {
          this.toasterService.errorToast(response.msg);
        }
      });
    }
  }
}
