import { Component } from '@angular/core';
import { GenericTableComponent } from '../shared/components/generic-table/generic-table.component';
import { ButtonModule } from 'primeng/button';
import { DetailsSectionComponent } from '../shared/details-section/details-section.component';
import { HeaderComponent } from '../header/header.component';
import { ModuleAccessSingle } from '../shared/interface/module-access.interface';

@Component({
  selector: 'app-resource-type',
  standalone: true,
  imports: [
    GenericTableComponent,
    ButtonModule,
    DetailsSectionComponent,
    HeaderComponent,
  ],
  templateUrl: './resource-type.component.html',
  styleUrl: './resource-type.component.scss',
})
export class ResourceTypeComponent {
  public moduleAccess!: ModuleAccessSingle;

  public constructor() {}

  openAddResourceTypeDialog() {}
}
