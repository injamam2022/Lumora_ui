import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
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
export class SidebarComponent implements OnInit {
  items: MenuItem[] = [];

  @Input() fetchSidebarClass = '';

  public moduleAccess!: ModuleAccessSingle;

  constructor(
    public genericResolverHttpClientService: GenericResolverHttpClientService,
    public checkModuleAccessService: CheckModuleAccessService
  ) {}

  getRouteForModule(mod: any): string {
    switch ((mod.module_name || '').trim()) {
      case 'Dashboard':
        return 'dashboard';
      case 'Manage Department':
        return 'manage-department';
      case 'Manage Role':
        return 'manage-role';
      case 'Manage  User':
        return 'manage-user';
      case 'User Access':
        return 'user-access';
      case 'Manage Process':
        return 'manage-process';
      case 'Manage Facility':
        return 'manage-facility';
      case 'Fixed Resource':
        return 'fixed-resource';
      case 'Portable Resource':
        return 'portable-resource';
      case 'Resource Management':
        return 'resource-management';
      default:
        return (mod.controller_name || '').trim();
    }
  }

  getIconForModule(mod: any): string {
    switch ((mod.module_name || '').trim()) {
      case 'Dashboard':
        return 'pi pi-home';
      case 'Manage Department':
        return 'pi pi-sitemap';
      case 'Manage Role':
        return 'pi pi-users';
      case 'Manage  User':
        return 'pi pi-user-edit';
      case 'User Access':
        return 'pi pi-key';
      case 'Manage Process':
        return 'pi pi-cog';
      case 'Manage Facility':
        return 'pi pi-building';
      case 'Fixed Resource':
        return 'pi pi-box';
      case 'Portable Resource':
        return 'pi pi-mobile';
      case 'Resource Management':
        return 'pi pi-boxes';
      default:
        return 'pi pi-folder';
    }
  }

  ngOnInit() {
    const storedAccess = JSON.parse(
      localStorage.getItem('moduleAccess') || '[]'
    );
    const modules = (storedAccess || []).filter((m: any) => m?.view_status);

    // 👉 Decide what lives under “Masters”
    const mastersControllers = new Set<string>([
      'department',
      'role',
      'user',
      'manage-access',
      'facility',
      'material',
      'resource-management',
      'room',
    ]);
    // If you prefer DB-driven grouping, swap the predicate to:
    // const isMaster = (m:any) => Number(m.module_status) === 0; // or whatever flag means "Master"
    const isMaster = (m: any) =>
      mastersControllers.has((m.controller_name || '').trim());

    // Preserve order by priority_status if present
    const sorted = [...modules].sort(
      (a, b) => Number(a.priority_status || 0) - Number(b.priority_status || 0)
    );

    const masters = sorted.filter(isMaster);
    const others = sorted.filter((m) => !isMaster(m));

    const toLeaf = (m: any): MenuItem => ({
      label: (m.module_name || '').trim(),
      icon: this.getIconForModule(m),
      // use routerLink (SPA). If you need module_id in the URL, uncomment the second line.
      routerLink: ['/', this.getRouteForModule(m)],
      // routerLink: ['/', this.getRouteForModule(m), m.module_id],
    });

    const mastersNode: MenuItem | null = masters.length
      ? {
          label: 'Masters',
          icon: 'pi pi-database',
          items: masters.map(toLeaf),
        }
      : null;

    this.items = [...others.map(toLeaf), ...(mastersNode ? [mastersNode] : [])];
  }
}
