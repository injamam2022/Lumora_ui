import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PortableResourceService } from '../services/portable-resource.service';
import { ToasterService } from '../../shared/services/toaster.service';

@Component({
  selector: 'app-portable-resource-creation',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule],
  templateUrl: './portable-resource-creation.component.html',
  styleUrl: './portable-resource-creation.component.scss',
})
export class PortableResourceCreationComponent {
  public addPortableResourcePayload = {
    resourceName: '',
    resourceType: '',
    resourceCode: '',
    capacityUnit: '',
    capacityQuantity: 0
  };

  public constructor(
    private readonly config: DynamicDialogConfig,
    public portableResourceService: PortableResourceService,
    public toasterService: ToasterService,
    private readonly ref: DynamicDialogRef
  ) {}

  ngOnInit() {
    if (this.config.data.purpose === 'edit') {
      this.portableResourceService
        .getSinglePortableResource(this.config.data.id)
        .subscribe((responseData) => {
          const resource = responseData.all_list[0];
          this.addPortableResourcePayload.resourceName = resource.resource_name;
          this.addPortableResourcePayload.resourceType = resource.resource_type;
          this.addPortableResourcePayload.resourceCode = resource.resource_code;
          this.addPortableResourcePayload.capacityUnit = resource.capacity_unit;
          this.addPortableResourcePayload.capacityQuantity = resource.capacity_quantity;
        });
    }
  }

  public addCreation() {
    const payload = {
      resource_name: this.addPortableResourcePayload.resourceName,
      resource_type: this.addPortableResourcePayload.resourceType,
      resource_code: this.addPortableResourcePayload.resourceCode,
      capacity_unit: this.addPortableResourcePayload.capacityUnit,
      capacity_quantity: this.addPortableResourcePayload.capacityQuantity
    };
    if (this.config.data.purpose === 'edit') {
      this.portableResourceService
        .updatePortableResource(payload, this.config.data.id)
        .subscribe((response) => {
          this.toasterService.successToast('Portable Resource Updated');
          this.portableResourceService.refreshTableData(true);
        });
      this.ref.close();
    } else if (this.config.data.purpose === 'add') {
      this.portableResourceService
        .addPortableResource(payload)
        .subscribe((response) => {
          this.toasterService.successToast('Portable Resource Added');
          this.portableResourceService.refreshTableData(true);
        });
      this.ref.close();
    }
  }
} 