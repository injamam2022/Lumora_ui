import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
import { CommonModule } from '@angular/common';
import { delay, Observable } from 'rxjs';
import { LoadingSpinnerService } from './shared/services/loading-spinner.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ButtonModule,
    ToastModule,
    MessagesModule,
    CommonModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'medicine_ui';

  public loading$: Observable<boolean> | undefined;
  constructor(public loadingSpinnerService: LoadingSpinnerService) {}

  public ngOnInit(): void {
    this.loading$ = this.loadingSpinnerService.loading$.pipe(delay(0));
  }
}
