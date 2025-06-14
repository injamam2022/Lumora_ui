import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { StaticDialogComponentComponent } from '../components/generic-table/static-dialog-component/static-dialog-component.component';

@Injectable({
  providedIn: 'root',
})
export class GlobalHttpClientService {
  constructor(
    public confirmationService: ConfirmationService,
    public dialogService: DialogService
  ) {}

  public showConfirmationDialog(
    accept: () => void,
    message: string,
    reject: () => void,
    header: string
  ) {
    this.confirmationService.confirm({
      accept,
      closeOnEscape: true,
      header,
      icon: 'fa-solid fa-triangle-exclamation',
      message,
      reject,
      acceptLabel: 'Accept',
      rejectLabel: 'Reject',
    });
  }

  public showError(
    headerTitle: string,
    message: string,
    status?: number
  ): void {
    if (status) {
      headerTitle = `${headerTitle} : ${status}`;
    }
    console.log(message);
    const data = {
      header: headerTitle,
      icon: 'fa-solid fa-triangle-exclamation',
      message: message,
      messageType: 'Error',
      closable: false,
    };
    this.showDialog(data);
  }

  private showDialog(data: {
    icon: string;
    message: string;
    messageType: string;
  }): void {
    this.dialogService.open(StaticDialogComponentComponent, {
      data,
      closeOnEscape: true,
      width: '50rem',
      closable: false,
    });
  }
}
