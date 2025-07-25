import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MaterialService } from '../services/material.service';
import { ToasterService } from '../../shared/services/toaster.service';

@Component({
  selector: 'app-material-creation',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule],
  templateUrl: './material-creation.component.html',
  styleUrl: './material-creation.component.scss',
})
export class MaterialCreationComponent {
  public addMaterialPayload = {
    productName: '',
    productDesc: '',
    productType: ''
  };

  public constructor(
    private readonly config: DynamicDialogConfig,
    public materialService: MaterialService,
    public toasterService: ToasterService,
    private readonly ref: DynamicDialogRef
  ) {}

  ngOnInit() {
    if (this.config.data.purpose === 'edit') {
      this.materialService
        .getSingleMaterial(this.config.data.id)
        .subscribe((responseData) => {
          const material = responseData.all_list[0];
          this.addMaterialPayload.productName = material.product_name;
          this.addMaterialPayload.productDesc = material.product_desc;
          this.addMaterialPayload.productType = material.product_type;
        });
    }
  }

  public addCreation() {
    const payload = {
      product_name: this.addMaterialPayload.productName,
      product_desc: this.addMaterialPayload.productDesc,
      product_type: this.addMaterialPayload.productType
    };
    if (this.config.data.purpose === 'edit') {
      this.materialService
        .updateMaterial(payload, this.config.data.id)
        .subscribe((response) => {
          this.toasterService.successToast('Material Updated');
          this.materialService.refreshTableData(true);
        });
      this.ref.close();
    } else if (this.config.data.purpose === 'add') {
      this.materialService
        .addMaterial(payload)
        .subscribe((response) => {
          this.toasterService.successToast('Material Added');
          this.materialService.refreshTableData(true);
        });
      this.ref.close();
    }
  }
} 