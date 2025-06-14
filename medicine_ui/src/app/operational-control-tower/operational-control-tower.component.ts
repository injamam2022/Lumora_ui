import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-operational-control-tower',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, ChartModule, CardModule],
  templateUrl: './operational-control-tower.component.html',
  styleUrl: './operational-control-tower.component.scss'
})
export class OperationalControlTowerComponent {

  // Data and options for the productivity bar chart
  productivityChartData: any;
  productivityChartOptions: any;

  // Data and options for Utilization chart
  utilizationChartData: any;
  utilizationChartOptions: any;

  // Data and options for OEE chart
  oeeChartData: any;
  oeeChartOptions: any;

  constructor() {
    // Initialize chart data and options in the constructor or ngOnInit
    this.initializeProductivityChart();
    this.initializeUtilizationChart();
    this.initializeOEEChart();
  }

  initializeProductivityChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.productivityChartData = {
      labels: ['MTD', 'Last 3M', 'YTD'],
      datasets: [
        {
          label: 'PRODUCTION OST (# CR PILLS)',
          backgroundColor: documentStyle.getPropertyValue('--green-500'),
          borderColor: documentStyle.getPropertyValue('--green-500'),
          data: [3.6, 5.7, 9.8]
        },
        {
          label: 'PRODUCTION NON-OST (# CR UNITS)',
          backgroundColor: documentStyle.getPropertyValue('--red-500'),
          borderColor: documentStyle.getPropertyValue('--red-500'),
          data: [4.0, 5.7, 10.0]
        }
      ]
    };

    this.productivityChartOptions = {
      // Chart options (title, scales, etc.) can be added here
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  initializeUtilizationChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.utilizationChartData = {
      labels: ['MTD', 'Last 3M', 'YTD'],
      datasets: [
        {
          label: 'Utilization (%)',
          backgroundColor: documentStyle.getPropertyValue('--green-500'), // Example color
          borderColor: documentStyle.getPropertyValue('--green-500'), // Example color
          data: [3.7, 5.5, 10.0] // Sample data
        }
      ]
    };

    this.utilizationChartOptions = {
       plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  initializeOEEChart() {
     const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.oeeChartData = {
       labels: ['MTD', 'Last 3M', 'YTD'],
      datasets: [
        {
          label: 'OEE (%)',
           backgroundColor: documentStyle.getPropertyValue('--green-500'), // Example color
          borderColor: documentStyle.getPropertyValue('--green-500'), // Example color
          data: [3.6, 6.0, 10.0] // Sample data
        }
      ]
    };

    this.oeeChartOptions = {
       plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

}
