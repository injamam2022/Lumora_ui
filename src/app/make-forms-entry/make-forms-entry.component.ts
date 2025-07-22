import { Component, Input } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ProcessExecutionService } from '../shared/services/process-execution.service';
import { DialogService } from 'primeng/dynamicdialog';
import { ToasterService } from '../shared/services/toaster.service';
import { ProcessListOfData } from '../stage-creation/interface/process-creation.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-make-forms-entry',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './make-forms-entry.component.html',
  styleUrl: './make-forms-entry.component.scss'
})
export class MakeFormsEntryComponent {
  @Input() public processId = '';
  public processData: ProcessListOfData | null = null;


  public constructor(
    public processExecutionService: ProcessExecutionService,
    public dialogService: DialogService,
    public toasterService: ToasterService
  ) {}


  ngOnInit(){
    this.processExecutionService
    .getSingleProcessExecution(this.processId)
    .subscribe((response) => {
      this.processData = response.data;
      console.log(this.processData);
    });
  }

}
