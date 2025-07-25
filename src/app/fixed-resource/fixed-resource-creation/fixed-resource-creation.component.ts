import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FixedResourceService } from '../services/fixed-resource.service';
import { ToasterService } from '../../shared/services/toaster.service';

@Component({
  selector: 'app-fixed-resource-creation',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule],
  templateUrl: './fixed-resource-creation.component.html',
  styleUrl: './fixed-resource-creation.component.scss',
})
export class FixedResourceCreationComponent {
  public addFixedResourcePayload = {
    resourceName: '',
    resourceType: '',
    resourceCode: '',
    capacityUnit: '',
    capacityQuantity: 0
  };

  public constructor(
    private readonly config: DynamicDialogConfig,
    public fixedResourceService: FixedResourceService,
    public toasterService: ToasterService,
    private readonly ref: DynamicDialogRef
  ) {}

  ngOnInit() {
    if (this.config.data.purpose === 'edit') {
      this.fixedResourceService
        .getSingleFixedResource(this.config.data.id)
        .subscribe((responseData) => {
          const resource = responseData.all_list[0];
          this.addFixedResourcePayload.resourceName = resource.resource_name;
          this.addFixedResourcePayload.resourceType = resource.resource_type;
          this.addFixedResourcePayload.resourceCode = resource.resource_code;
          this.addFixedResourcePayload.capacityUnit = resource.capacity_unit;
          this.addFixedResourcePayload.capacityQuantity = resource.capacity_quantity;
        });
    }
  }

  public addCreation() {
    const payload = {
      resource_name: this.addFixedResourcePayload.resourceName,
      resource_type: this.addFixedResourcePayload.resourceType,
      resource_code: this.addFixedResourcePayload.resourceCode,
      capacity_unit: this.addFixedResourcePayload.capacityUnit,
      capacity_quantity: this.addFixedResourcePayload.capacityQuantity
    };
    if (this.config.data.purpose === 'edit') {
      this.fixedResourceService
        .updateFixedResource(payload, this.config.data.id)
        .subscribe((response) => {
          this.toasterService.successToast('Fixed Resource Updated');
          this.fixedResourceService.refreshTableData(true);
        });
      this.ref.close();
    } else if (this.config.data.purpose === 'add') {
      this.fixedResourceService
        .addFixedResource(payload)
        .subscribe((response) => {
          this.toasterService.successToast('Fixed Resource Added');
          this.fixedResourceService.refreshTableData(true);
        });
      this.ref.close();
    }
  }
}
