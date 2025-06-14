import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  constructor(private readonly messageService: MessageService) {}

  public successToast(message: string): void {
    this.messageService.add({
      life: 1000,
      severity: 'success',
      summary: 'Success',
      detail: message,
    });
  }

  public errorToast(message: string): void {
    this.messageService.add({
      life: 1000,
      severity: 'error',
      detail: message,
    });
  }
}
