import { Component } from '@angular/core';
import {
  ProcessCreation,
  ProcessListOfData,
} from '../stage-creation/interface/process-creation.interface';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProcessExecutionService } from '../shared/services/process-execution.service';
import { Router } from '@angular/router';
import { ToasterService } from '../shared/services/toaster.service';

@Component({
  selector: 'app-process-creation',
  standalone: true,
  imports: [
    SidebarComponent,
    HeaderComponent,
    CardModule,
    FormsModule,
    InputTextModule,
    CommonModule,
    MultiSelectModule,
  ],
  templateUrl: './process-creation.component.html',
  styleUrl: './process-creation.component.scss',
})
export class ProcessCreationComponent {
  public processCreationData: ProcessListOfData = {
    process_name: '',
    format_number: '',
    reference_document: '',
    sop_id: '',
  };

  constructor(
    public processExecutionService: ProcessExecutionService,
    public router: Router,
    public toasterService: ToasterService
  ) {}

  createProcess() {
    console.log();
    this.processExecutionService
      .createProcessFirst(this.processCreationData)
      .subscribe((response) => {
        if (response.stat == 200) {
          this.toasterService.successToast(
            'Process Created.You can Add Stages Now'
          );
          this.router.navigate(['/stage-creation/' + response.insert_id]);
        }
      });
  }
}
