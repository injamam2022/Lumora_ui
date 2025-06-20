import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GenericResolverHttpClientService {
  public addExtendedClass = '';
  constructor() {}

  public addExtendSidebarClass(className: string) {
    this.addExtendedClass = className;
  }

  public fetchExtendSidebarClass() {
    return this.addExtendedClass;
  }
}
