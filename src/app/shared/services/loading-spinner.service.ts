import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingSpinnerService {
  private readonly loading = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this.loading.asObservable();

  constructor() {}

  public show() {
    this.loading$.subscribe((data) => {});
    this.loading.next(true);
  }

  public hide() {
    this.loading$.subscribe((data) => {});

    this.loading.next(false);
  }
}
