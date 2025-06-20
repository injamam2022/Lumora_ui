import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Parameter, ParameterTypeAllList } from '../../../../stage-creation/interface/process-creation.interface';
import { ParameterDialogComponent } from '../parameter-dialog/parameter-dialog.component';
import { CommonModule } from '@angular/common';
import { ToasterService } from '../../../services/toaster.service';
import { ProcessExecutionService } from '../../../services/process-execution.service';
import { SidebarComponent } from '../../../../sidebar/sidebar.component';
import { HeaderComponent } from '../../../../header/header.component';

@Component({
  selector: 'app-parameter-management',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    DynamicDialogModule,
    CommonModule,
    SidebarComponent,
    HeaderComponent
  ],
  providers: [DialogService],
  templateUrl: './parameter-management.component.html',
  styleUrl: './parameter-management.component.scss'
})
export class ParameterManagementComponent implements OnInit {
  parameters: Parameter[] = [];
  parameterTypes: ParameterTypeAllList[] = [];
  ref: DynamicDialogRef | undefined;

  constructor(
    public dialogService: DialogService,
    private toasterService: ToasterService,
    private processExecutionService: ProcessExecutionService
  ) {}

  ngOnInit() {
    this.loadParameterTypes();
    this.loadParameters();
  }

  loadParameterTypes() {
    // This should ideally come from a service call
    this.parameterTypes = [
      { parameter_type_id: '1', parameter_type_name: 'Text', parameter_type_description: '', added_date: '', del_status: '' },
      { parameter_type_id: '2', parameter_type_name: 'Number', parameter_type_description: '', added_date: '', del_status: '' },
      { parameter_type_id: '3', parameter_type_name: 'Date', parameter_type_description: '', added_date: '', del_status: '' }
    ];
  }

  loadParameters() {
    // Load existing parameters (mock data for now)
    this.parameters = [
      { task_id: '1', stage_id: '1', parameter_id: '101', parameter_name: 'Param A', parameter_description: 'Description A', parameter_type_id: '1' },
      { task_id: '2', stage_id: '1', parameter_id: '102', parameter_name: 'Param B', parameter_description: 'Description B', parameter_type_id: '2' },
    ];
  }

  getParameterTypeName(typeId: string): string {
    const type = this.parameterTypes.find(p => p.parameter_type_id === typeId);
    return type ? type.parameter_type_name : 'Unknown';
  }

  openNewParameterDialog() {
    this.ref = this.dialogService.open(ParameterDialogComponent, {
      header: 'Add New Parameter',
      width: '40%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
    });

    this.ref.onClose.subscribe((parameter: Parameter) => {
      if (parameter) {
        this.toasterService.successToast('Parameter added successfully');
        this.parameters.push(parameter); // Add the new parameter to the table
      }
    });
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.close();
    }
  }
}
