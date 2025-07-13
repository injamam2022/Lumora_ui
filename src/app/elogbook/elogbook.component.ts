import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ButtonModule } from 'primeng/button';
import { GenericTableComponent } from '../shared/components/generic-table/generic-table.component';
import { TableColumn } from '../user/interface/table-column.interface';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ElogbookFormBuilderComponent } from './elogbook-form-builder.component';
import { ElogbookService } from '../shared/services/elog-execution.service';
import { ElogbookListData } from '../manage-process/interface/manage-process-interface';
import { Router } from '@angular/router';
import { EntityIdMapping } from '../shared/enum/entity-is-mapping.enum';
import { ParameterManagementComponent } from '../shared/components/parameter-management/parameter-management/parameter-management.component';
import { FilterMatchMode } from 'primeng/api';
import { ToasterService } from '../shared/services/toaster.service';

@Component({
  selector: 'app-elogbook',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    ButtonModule,
    GenericTableComponent,
    CommonModule,
    ElogbookFormBuilderComponent,
    ParameterManagementComponent
  ],
  providers: [DialogService],
  templateUrl: './elogbook.component.html',
  styleUrl: './elogbook.component.scss'
})
export class ElogbookComponent {
  public genericTableColumns: TableColumn[] = [];

  private ref: DynamicDialogRef | undefined;

  public allElogbookListData!: ElogbookListData;

  public entityIdMapping = EntityIdMapping;

  constructor(private dialogService: DialogService, private elogbookService: ElogbookService, public router: Router, public toasterService: ToasterService,) {
    this.getElogbookList();
    this.setGenericTableColumns();
  }

  ngOnInit() {
    // Optionally load from backend here
    const userData = localStorage.getItem('userData');
    const roleId = userData ? JSON.parse(userData).role_id : undefined;
    this.elogbookService.refreshElogbook$.subscribe((data) => {
    this.elogbookService.getAllElogBook(roleId).subscribe((response) => {
      console.log(response);
      this.allElogbookListData = response;
    }
  );
  });
  }

  public editParticularData(editId: string) {
    this.router.navigate(['/elogs-creation'], { queryParams: { id: editId } });
  }

  openAddElogbookPage() {
    this.router.navigate(['/elogs-creation']);
  }

  setGenericTableColumns() {
    this.genericTableColumns = [
      {
        field: 'elogs_name',
        header: 'E-Logbook Name',
        hasFilter: true,
        hasSorting: true,
        translationColumnKey: 'E-Logbook Name',
        mappedProperty: 'elogs_name',
        matchModeOptions: [
          { label: 'Contains', value: FilterMatchMode.CONTAINS },
        ],
      },
      {
        field: 'sop_id',
        header: 'E-Logbook ID',
        hasFilter: true,
        hasSorting: true,
        translationColumnKey: 'E-Logbook ID',
        mappedProperty: 'sop_id',
        matchModeOptions: [
          { label: 'Contains', value: FilterMatchMode.CONTAINS },
        ],
      },
      /*{
        field: 'created_by',
        header: 'Created By',
        hasFilter: true,
        hasSorting: true,
        translationColumnKey: 'Created By',
        mappedProperty: 'created_by',
        matchModeOptions: [
          { label: 'Contains', value: FilterMatchMode.CONTAINS },
        ],
      },*/
      {
        field: 'added_date',
        header: 'Created Date',
        hasFilter: true,
        hasSorting: true,
        translationColumnKey: 'Created Date',
        mappedProperty: 'added_date',
        matchModeOptions: [
          { label: 'Contains', value: FilterMatchMode.CONTAINS },
        ],
      },
    ];
  }

  getElogbookList() {
    this.elogbookService.getAllElogBook().subscribe({
      next: (response: any) => {
        this.allElogbookListData = response;
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  public deleteParticularData(deleteId: string) {
    console.log('Delete ID:', deleteId);
      this.elogbookService.deleteElogbook(deleteId).subscribe((response) => {
        console.log(response);
        if (response.stat === 200) {
          this.toasterService.successToast('Deleted Successfully');
          this.elogbookService.refreshTableData(true);
          this.getElogbookList();
        } /*else {
            alert('Failed to delete E-Logbook');
          }*/
        }
        /*error: () => {
          alert('Error deleting E-Logbook');
        }*/

    );

  }
}
