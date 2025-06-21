import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-operator-dashboard',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, CommonModule],
  templateUrl: './operator-dashboard.component.html',
  styleUrl: './operator-dashboard.component.scss',
  providers: [
    {
      provide: 'NgChartsConfiguration',
      useValue: {
        generateColors: false,
      },
    },
  ],
})
export class OperatorDashboardComponent {
  equipmentName = 'BQS Bulk packaging machine';
  ratedSpeed = '2,800rpm';
  validatedSpeed = '2,500rpm';

  trends = [
    { label: 'Improvement', icon: '↑', class: 'up' },
    { label: 'Decline', icon: '↓', class: 'down' },
    { label: 'No Change', icon: '→', class: 'no-change' },
  ];

  productionVolume = [
    { value: 8, remaining: 82, color: '#ef4444' },
    { value: 28, remaining: 62, color: '#ef4444' },
    { value: 17, remaining: 73, color: '#22c55e' },
  ];

  oeeData = [
    { value: 92, remaining: 8, color: '#22c55e' },
    { value: 88, remaining: 12, color: '#ef4444' },
    { value: 94, remaining: 6, color: '#22c55e' },
  ];
}
