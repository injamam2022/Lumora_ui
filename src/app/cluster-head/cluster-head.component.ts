import { Component } from '@angular/core';
import { Sidebar } from 'primeng/sidebar';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cluster-head',
  standalone: true,
  imports: [SidebarComponent,HeaderComponent,CommonModule],
  templateUrl: './cluster-head.component.html',
  styleUrl: './cluster-head.component.scss'
})
export class ClusterHeadComponent {
  metricData = [
    {
      title: 'PRODUCTION OSD (# CR PILLS)',
      trend: 'up',
      arrow: '↑',
      budget: ['1.1', '3.1', '4.9'],
      actual: ['1.5', '2.6', '4.4'],
    },
    {
      title: 'PRODUCTION NON-OSD (# CR UNITS)',
      trend: 'down',
      arrow: '↓',
      budget: ['1.4', '3.6', '5.9'],
      actual: ['1.1', '3.1', '4.9'],
    },
    {
      title: 'UTILIZATION (%)',
      trend: 'down',
      arrow: '↓',
      budget: ['91%', '89%', '92%'],
      actual: ['84%', '91%', '90%'],
    },
    {
      title: 'OEE (%)',
      trend: 'no-change',
      arrow: '→',
      budget: ['84%', '84%', '86%'],
      actual: ['81%', '87%', '87%'],
    },
    {
      title: "MANPOWER PRODUCTIVITY ('000PILLS/FTE)",
      trend: 'up',
      arrow: '↑',
      budget: ['2', '6', '10'],
      actual: ['3', '5', '9'],
    },
    {
      title: 'YIELD OSD (%)',
      trend: 'down',
      arrow: '↓',
      budget: ['2', '6', '11'],
      actual: ['1', '5', '10'],
    },
    {
      title: 'YIELD NON-OSD (%)',
      trend: 'down',
      arrow: '↓',
      budget: ['89%', '90%', '89%'],
      actual: ['84%', '93%', '87%'],
    },
    {
      title: 'YIELD VARIANCE (%)',
      trend: 'no-change',
      arrow: '→',
      budget: ['84%', '86%', '84%'],
      actual: ['81%', '88%', '87%'],
    }
  ];
}
