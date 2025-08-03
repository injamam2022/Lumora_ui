import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FixedResourceService } from '../../fixed-resource/services/fixed-resource.service';
import { PortableResourceService } from '../../portable-resource/services/portable-resource.service';
import { ToasterService } from '../../shared/services/toaster.service';

@Component({
  selector: 'app-resource-creation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
  ],
  templateUrl: './resource-creation.component.html',
  styleUrl: './resource-creation.component.scss',
})
export class ResourceCreationComponent implements OnInit {
  public addResourcePayload = {
    resourceName: '',
    resourceType: '',
    resourceCode: '',
    capacityUnit: '',
    capacityQuantity: 0
  };

  public purpose: string = 'add';
  public resourceType: string = 'fixed';
  public editId: string = '';

  // Resource category dropdown
  public selectedResourceCategory: string = '';
  public resourceCategories = [
    { label: 'Fixed Resource', value: 'fixed' },
    { label: 'Portable Resource', value: 'portable' }
  ];

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    public fixedResourceService: FixedResourceService,
    public portableResourceService: PortableResourceService,
    public toasterService: ToasterService
  ) {}

  ngOnInit() {
    if (this.config.data) {
      this.purpose = this.config.data.purpose || 'add';
      this.resourceType = this.config.data.resourceType || 'fixed';
      this.selectedResourceCategory = this.resourceType;

      if (this.purpose === 'edit' && this.config.data.id) {
        this.editId = this.config.data.id;
        this.loadResourceForEdit();
      }
    }
  }

  public onResourceCategoryChange() {
    this.resourceType = this.selectedResourceCategory;
  }

  public loadResourceForEdit() {
    if (this.resourceType === 'fixed') {
      this.fixedResourceService.getSingleFixedResource(this.editId).subscribe((responseData: any) => {
        const resource = responseData.all_list[0];
        this.addResourcePayload.resourceName = resource.resource_name;
        this.addResourcePayload.resourceType = resource.resource_type;
        this.addResourcePayload.resourceCode = resource.resource_code;
        this.addResourcePayload.capacityUnit = resource.capacity_unit;
        this.addResourcePayload.capacityQuantity = resource.capacity_quantity;
      });
    } else {
      this.portableResourceService.getSinglePortableResource(this.editId).subscribe((responseData: any) => {
        const resource = responseData.all_list[0];
        this.addResourcePayload.resourceName = resource.resource_name;
        this.addResourcePayload.resourceType = resource.resource_type;
        this.addResourcePayload.resourceCode = resource.resource_code;
        this.addResourcePayload.capacityUnit = resource.capacity_unit;
        this.addResourcePayload.capacityQuantity = resource.capacity_quantity;
      });
    }
  }

  public addCreation() {
    if (!this.selectedResourceCategory) {
      this.toasterService.errorToast('Please select a resource category');
      return;
    }

    if (this.purpose === 'add') {
      this.createResource();
    } else {
      this.updateResource();
    }
  }

  public createResource() {
    const payload = {
      resource_name: this.addResourcePayload.resourceName,
      resource_type: this.addResourcePayload.resourceType,
      resource_code: this.addResourcePayload.resourceCode,
      capacity_unit: this.addResourcePayload.capacityUnit,
      capacity_quantity: this.addResourcePayload.capacityQuantity
    };

    if (this.resourceType === 'fixed') {
      this.fixedResourceService.addFixedResource(payload).subscribe((response: any) => {
        this.toasterService.successToast('Fixed Resource Added');
        this.fixedResourceService.refreshTableData(true);
        this.ref.close();
      });
    } else {
      this.portableResourceService.addPortableResource(payload).subscribe((response: any) => {
        this.toasterService.successToast('Portable Resource Added');
        this.portableResourceService.refreshTableData(true);
        this.ref.close();
      });
    }
  }

  public updateResource() {
    const payload = {
      resource_name: this.addResourcePayload.resourceName,
      resource_type: this.addResourcePayload.resourceType,
      resource_code: this.addResourcePayload.resourceCode,
      capacity_unit: this.addResourcePayload.capacityUnit,
      capacity_quantity: this.addResourcePayload.capacityQuantity
    };

    if (this.resourceType === 'fixed') {
      this.fixedResourceService.updateFixedResource(payload, this.editId).subscribe((response: any) => {
        this.toasterService.successToast('Fixed Resource Updated');
        this.fixedResourceService.refreshTableData(true);
        this.ref.close();
      });
    } else {
      this.portableResourceService.updatePortableResource(payload, this.editId).subscribe((response: any) => {
        this.toasterService.successToast('Portable Resource Updated');
        this.portableResourceService.refreshTableData(true);
        this.ref.close();
      });
    }
  }
}
