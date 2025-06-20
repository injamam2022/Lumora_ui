import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
import { Role } from '../role/interface/role.interface';
import { GenericResolverHttpClientService } from '../shared/services/generic-reolver-http-client.service';
import { CheckModuleAccessService } from '../shared/services/check-module-access.service';
import { ModuleAccessSingle } from '../shared/interface/module-access.interface';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [PanelMenuModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  items: MenuItem[0];

  @Input() fetchSidebarClass = '';

  public moduleAccess!: ModuleAccessSingle;

  public constructor(
    public genericResolverHttpClientService: GenericResolverHttpClientService,
    public checkModuleAccessService: CheckModuleAccessService
  ) {}

  getRouteForModule(mod: any): string {
    switch (mod.module_name.trim()) {
      case 'Dashboard': return 'dashboard';
      case 'Manage Department': return 'manage-department';
      case 'Manage Role': return 'manage-role';
      case 'Manage  User': return 'manage-user';
      case 'User Access': return 'user-access';
      case 'Manage Process': return 'manage-process';
      case 'Manage Facility': return 'manage-facility';
      default: return '';
    }
  }

  getIconForModule(mod: any): string {
    switch (mod.module_name.trim()) {
      case 'Dashboard': return 'pi pi-home';
      case 'Manage Department': return 'pi pi-sitemap';
      case 'Manage Role': return 'pi pi-users';
      case 'Manage  User': return 'pi pi-user-edit';
      case 'User Access': return 'pi pi-key';
      case 'Manage Process': return 'pi pi-cog';
      case 'Manage Facility': return 'pi pi-building';
      default: return 'pi pi-folder';
    }
  }

  ngOnInit() {
    const storedAccess = JSON.parse(localStorage.getItem('moduleAccess') || '[]');
    const modules = storedAccess.filter((mod: any) => mod.view_status);

    this.items = modules.map((mod: any) => ({
      label: mod.module_name,
      routerLink: [`/${mod.controller_name}`],
      icon: this.getIconForModule(mod)
    }));
  }
}
