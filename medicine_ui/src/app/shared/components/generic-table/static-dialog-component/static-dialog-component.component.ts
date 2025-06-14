import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-static-dialog-component',
  standalone: true,
  imports: [DialogModule, ButtonModule, ConfirmDialogModule],
  templateUrl: './static-dialog-component.component.html',
  styleUrl: './static-dialog-component.component.scss',
})
export class StaticDialogComponentComponent {
  public dialogMessage!: string;

  public dialogTitle!: string;

  constructor(
    private readonly config: DynamicDialogConfig,
    private readonly ref: DynamicDialogRef
  ) {
    this.dialogMessage = this.config.data.message;

    this.dialogTitle = this.config.data.messageType;
  }

  public closeDialog(): void {
    this.ref.close();
  }
}
