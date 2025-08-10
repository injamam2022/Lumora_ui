import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';

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

  // 1) controller_name -> route path (no leading slash)
  private routeMap: Record<string, string> = {
    dashboard: 'dashboard',
    'operational-control-tower': 'operational-control-tower',

    department: 'department',
    role: 'role',
    user: 'user',
    'manage-access': 'manage-access',

    'manage-process': 'manage-process',
    'process-creation': 'process-creation', // if ever needed
    'stage-creation': 'stage-creation', // if ever needed
    'branching-rules': 'branching-rules', // if ever needed
    'parameter-creation': 'parameter-creation', // if ever needed

    facility: 'facility',
    room: 'room',
    material: 'material',
    'resource-management': 'resource-management',
    'fixed-resource': 'fixed-resource',
    'portable-resource': 'portable-resource',

    elogbook: 'elogbook',
    'elogs-creation': 'elogs-creation', // if ever needed

    'coo-dashboard': 'coo-dashboard',
    'cluster-head': 'cluster-head',
    'operator-dashboard': 'operator-dashboard',
    'make-forms-entry': 'make-forms-entry', // if ever needed with :processId
    module: 'module', // if you expose ModuleComponent
  };

  // 2) which controllers should be clubbed under “Masters”
  private mastersControllers = new Set<string>([
    'department',
    'role',
    'user',
    'manage-access',
    'manage-process',
    'facility',
    'room',
    'material',
    'resource-management',
    'fixed-resource',
    'portable-resource',
  ]);

  // 3) icon helper (still by module_name since that’s what you styled)
  private getIconForModule(mod: any): string {
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
      case 'Room':
        return 'pi pi-th-large';
      case 'Material':
        return 'pi pi-box';
      case 'Resource Management':
        return 'pi pi-boxes';
      case 'Fixed Resource':
        return 'pi pi-table';
      case 'Portable Resource':
        return 'pi pi-mobile';
      case 'E-Logbook ':
        return 'pi pi-book';
      case 'Operational Control Tower':
        return 'pi pi-compass';
      case 'COO Dashboard':
        return 'pi pi-chart-bar';
      case 'Cluster Head':
        return 'pi pi-briefcase';
      case 'Operator Dashboard':
        return 'pi pi-gauge';
      default:
        return 'pi pi-folder';
    }
  }

  private getRouteForController(controller_name: string): string {
    const key = (controller_name || '').trim();
    return this.routeMap[key] ?? key; // fallback: use controller as path
  }

  ngOnInit() {
    const storedAccess = JSON.parse(
      localStorage.getItem('moduleAccess') || '[]'
    );
    const modules = (storedAccess || []).filter((m: any) => m?.view_status);

    // keep your DB sort
    const sorted = [...modules].sort(
      (a, b) => Number(a.priority_status || 0) - Number(b.priority_status || 0)
    );

    const isMaster = (m: any) =>
      this.mastersControllers.has((m.controller_name || '').trim());
    const masters = sorted.filter(isMaster);
    const others = sorted.filter((m) => !isMaster(m));

    const toLeaf = (m: any): MenuItem => ({
      label: (m.module_name || '').trim(),
      icon: this.getIconForModule(m),
      // base path (no ID). If you want to pass :moduleId, append m.module_id here.
      routerLink: ['/', this.getRouteForController(m.controller_name)],
    });

    const mastersNode: MenuItem | null = masters.length
      ? { label: 'Masters', icon: 'pi pi-database', items: masters.map(toLeaf) }
      : null;

    this.items = [...others.map(toLeaf), ...(mastersNode ? [mastersNode] : [])];
  }
}
