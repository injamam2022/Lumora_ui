import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { DialogService, DynamicDialogRef, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ParameterDialogComponent } from '../shared/components/parameter-management/parameter-dialog/parameter-dialog.component';

interface Parameter {
  parameter_id?: string;
  parameter_name?: string;
  parameter_description: string;
  parameter_type_id: string;
  options?: string[];
  option_selected?: string;
}

@Component({
  selector: 'app-elogbook-parameter-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextareaModule, DropdownModule, DragDropModule, DynamicDialogModule],
  providers: [DialogService],
  templateUrl: './elogbook-parameter-list.component.html',
  styleUrls: ['./elogbook-parameter-list.component.scss']
})
export class ElogbookParameterListComponent {
  private _parameters: Parameter[] = [];
  @Input() set parameters(value: Parameter[]) {
    this._parameters = (value || []).map(p => ({
      ...p,
      options: Array.isArray(p.options) ? p.options : []
    }));
  }
  get parameters(): Parameter[] {
    return this._parameters;
  }
  @Output() parametersChange = new EventEmitter<Parameter[]>();

  parameterTypes = [
    { parameter_type_id: '1', parameter_type_name: 'Text' },
    { parameter_type_id: '2', parameter_type_name: 'Textarea' },
    { parameter_type_id: '3', parameter_type_name: 'Date' },
    { parameter_type_id: '4', parameter_type_name: 'Number' },
    { parameter_type_id: '5', parameter_type_name: 'Drop Down Option' },
  ];

  ref: DynamicDialogRef | undefined;
  constructor(public dialogService: DialogService) {}

  addParameter() {
    this.ref = this.dialogService.open(ParameterDialogComponent, {
      header: 'Add Parameters',
      width: '40%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: {}
    });
    this.ref.onClose.subscribe((parameter: Parameter) => {
      if (parameter) {
        this.parameters.push(parameter);
        this.parametersChange.emit(this.parameters);
      }
    });
  }

  removeParameter(index: number) {
    this.parameters.splice(index, 1);
    this.parametersChange.emit(this.parameters);
  }

  onDrop(event: CdkDragDrop<Parameter[]>) {
    moveItemInArray(this.parameters, event.previousIndex, event.currentIndex);
    this.parametersChange.emit(this.parameters);
  }

  addOption(param: Parameter) {
    if (!param.options) param.options = [];
    param.options.push('');
  }

  removeOption(param: Parameter, idx: number) {
    if (param.options) param.options.splice(idx, 1);
  }
}
