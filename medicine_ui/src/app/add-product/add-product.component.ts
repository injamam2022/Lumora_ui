import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { DetailsSectionComponent } from '../shared/details-section/details-section.component';
import { ButtonModule } from 'primeng/button';
import { GenericTableComponent } from '../shared/components/generic-table/generic-table.component';
import { TableColumn } from '../user/interface/table-column.interface';
import { FilterMatchMode } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { EntityIdMapping } from '../shared/enum/entity-is-mapping.enum';
import { ModuleAccessSingle } from '../shared/interface/module-access.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    HeaderComponent,
    DetailsSectionComponent,
    ButtonModule,
    GenericTableComponent,
    CommonModule,
  ],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss',
})
export class AddProductComponent {
  public genericTableColumns: TableColumn[] = [
    {
      field: 'departmentName',
      header: 'Department Name',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Department Name',
      mappedProperty: 'departmentName',
    },
    {
      field: 'createdAt',
      header: 'Created At',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Created At',
      mappedProperty: 'createdAt',
    },
  ];
  ref: DynamicDialogRef | undefined;

  //public allDepartmentData!: Department;

  public entityIdMapping = EntityIdMapping;

  //@Input() departmentModuleId = '';

  public moduleAccess!: ModuleAccessSingle;

  public editParticularData(editId: string) {
    console.log(editId);
    // this.ref = this.dialogService.open(DepartmentCreationComponent, {
    //   header: 'Edit Department',
    //   data: { purpose: 'edit', id: editId },
    //   width: '40%',
    // });
  }

  public deleteParticularData(deleteId: string) {
    //this.globalHttpClientService.showConfirmationDialog(any,'Are you Sure', 'hey',"s");
    //return;
    // this.departmentService.deleteDepartment(deleteId).subscribe((response) => {
    //   console.log(response);
    //   if (response.status) {
    //     this.toasterService.successToast('Deleted Successfully');
    //     this.departmentService.refreshTableData(true);
    //   }
    //   //this.allRoleData = response;
    // });
  }
}
