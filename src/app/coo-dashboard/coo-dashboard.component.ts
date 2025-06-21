import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-coo-dashboard',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent],
  templateUrl: './coo-dashboard.component.html',
  styleUrl: './coo-dashboard.component.scss'
})
export class CooDashboardComponent {

}
