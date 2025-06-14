import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { GenericTableComponent } from '../shared/components/generic-table/generic-table.component';
import { TableColumn } from '../user/interface/table-column.interface';
import { FilterMatchMode } from 'primeng/api';

@Component({
  selector: 'app-module',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, GenericTableComponent],
  templateUrl: './module.component.html',
  styleUrl: './module.component.scss',
})
export class ModuleComponent {
  public genericTableColumns: TableColumn[] = [
    {
      field: 'roleName',
      header: 'Role Name',
      hasFilter: true,
      hasSorting: true,
      matchModeOptions: [
        {
          label: 'Contains',
          value: FilterMatchMode.CONTAINS,
        },
      ],
      translationColumnKey: 'Role Name',
      mappedProperty: 'roleName',
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

  //   public allModuleData!: Role;

  //   constructor(public loginHttpClientService: LoginHttpClientService) {}

  //   public ngOnInit() {
  //     this.loginHttpClientService.getAllRoles().subscribe((response) => {
  //       console.log(response);
  //       this.allRoleData = response;
  //     });
  //   }
}
