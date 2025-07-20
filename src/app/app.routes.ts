import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserComponent } from './user/user.component';
import { RoleComponent } from './role/role.component';
import { ModuleComponent } from './module/module.component';
import { ManageAccessComponent } from './manage-access/manage-access.component';
import { DepartmentComponent } from './department/department.component';
import { FacilityComponent } from './facility/facility.component';
import { authGuard } from './shared/guard/auth.guard';
import { ChooseFacilityComponent } from './choose-facility/choose-facility.component';
import { ResourceTypeComponent } from './resource-type/resource-type.component';
import { ResourceRoomComponent } from './resource-room/resource-room.component';
import { ResourceCreationComponent } from './resource-creation/resource-creation.component';
import { AddProductComponent } from './add-product/add-product.component';
import { StageCreationComponent } from './stage-creation/stage-creation.component';
import { ParameterManagementComponent } from './shared/components/parameter-management/parameter-management/parameter-management.component';
import { ManageProcessComponent } from './manage-process/manage-process.component';
import { BranchingRulesComponent } from './branching-rules/branching-rules.component';
import { ProcessCreationComponent } from './process-creation/process-creation.component';
import { ElogbookComponent } from './elogbook/elogbook.component';
import { ElogbookFormBuilderComponent } from './elogbook/elogbook-form-builder.component';
import { OperationalControlTowerComponent } from './operational-control-tower/operational-control-tower.component';
import { CooDashboardComponent } from './coo-dashboard/coo-dashboard.component';
import { ClusterHeadComponent } from './cluster-head/cluster-head.component';
import { OperatorDashboardComponent } from './operator-dashboard/operator-dashboard.component';
import { MakeFormsEntryComponent } from './make-forms-entry/make-forms-entry.component';
export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [],
  },
  {
    path: 'operational-control-tower',
    component: OperationalControlTowerComponent,
    canActivate: [],
  },
  {
    path: 'dashboard/:dashboardModuleId',
    component: DashboardComponent,
    canActivate: [],
  },
  {
    path: 'department',
    component: DepartmentComponent,
    canActivate: [],
  },
  {
    path: 'department/:departmentModuleId',
    component: DepartmentComponent,
    canActivate: [],
  },
  { path: 'user', component: UserComponent, canActivate: [authGuard] },
  {
    path: 'user/:userModuleId',
    component: UserComponent,
    canActivate: [],
  },
  { path: 'role', component: RoleComponent, canActivate: [] },
  {
    path: 'role/:roleModuleId',
    component: RoleComponent,
    canActivate: [],
  },
  { path: 'module', component: ModuleComponent, canActivate: [] },
  {
    path: 'manage-access',
    component: ManageAccessComponent,
    canActivate: [],
  },
  {
    path: 'manage-access/:accessModuleId',
    component: ManageAccessComponent,
    canActivate: [],
  },
  { path: 'facility', component: FacilityComponent, canActivate: [authGuard] },
  {
    path: 'facility/:facilityModuleId',
    component: FacilityComponent,
    canActivate: [],
  },
  {
    path: 'choose-facility',
    component: ChooseFacilityComponent,
    canActivate: [],
  },
  {
    path: 'resource-type',
    component: ResourceTypeComponent,
    canActivate: [],
  },
  {
    path: 'resource-type/:resource-type-id',
    component: ResourceTypeComponent,
    canActivate: [],
  },
  {
    path: 'manage-resource-room',
    component: ResourceRoomComponent,
    canActivate: [],
  },
  {
    path: 'manage-resource-room/:resource-room-id',
    component: ResourceRoomComponent,
    canActivate: [],
  },
  {
    path: 'manage-resource',
    component: ResourceCreationComponent,
    canActivate: [],
  },
  {
    path: 'manage-resource/:resource-id',
    component: ResourceCreationComponent,
    canActivate: [],
  },
  {
    path: 'manage-product',
    component: AddProductComponent,
  },
  {
    path: 'stage-creation',
    component: StageCreationComponent,
    canActivate: [],
  },
  {
    path: 'stage-creation/:processId',
    component: StageCreationComponent,
    canActivate: [],
  },
  {
    path: 'branching-rules/:processId',
    component: BranchingRulesComponent,
    canActivate: [],
  },
  {
    path: 'parameter-creation',
    component: ParameterManagementComponent,
    canActivate: [],
  },
  {
    path: 'manage-process',
    component: ManageProcessComponent,
    canActivate: [],
  },
  {
    path: 'process-creation',
    component: ProcessCreationComponent,
    canActivate: [],
  },
  {
    path: 'elogbook',
    component: ElogbookComponent,
    canActivate: [],
  },
  {
    path: 'elogs-creation',
    component: ElogbookFormBuilderComponent,
    canActivate: [],
  },
  {
    path: 'manage-process/:manageProcessModuleId',
    component: ManageProcessComponent,
    canActivate: [],
  },
  {
    path: 'coo-dashboard',
    component: CooDashboardComponent,
    canActivate: [],
  },
  {
    path: 'cluster-head',
    component: ClusterHeadComponent,
    canActivate: [],
  },
  {
    path: 'operator-dashboard',
    component: OperatorDashboardComponent,
    canActivate: [],
  },
  {
    path: 'make-forms-entry/:processId',
    component: MakeFormsEntryComponent,
    canActivate: [],
  },
];
