import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { PrimeIcons } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { GenericResolverHttpClientService } from '../shared/services/generic-reolver-http-client.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LoginHttpClientService } from '../login/service/login-http-client.service';
import { ToasterService } from '../shared/services/toaster.service';
import { Router } from '@angular/router';
import { FacilityData } from '../choose-facility/facility-interface/facility-interface';

interface City {
  name: string;
  code: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, DropdownModule, CommonModule, SidebarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  cities: City[] | undefined;

  selectedCity: City | undefined;

  public extendSidebarClass = '';
  public optionForUserFacility!: FacilityData;

  public constructor(
    public loginHttpClientService: LoginHttpClientService,
    public toasterService: ToasterService,
    public genericResolverHttpClientService: GenericResolverHttpClientService,
    public router: Router
  ) {}

  ngOnInit() {
    let facilityAccessNames: any = localStorage.getItem('facilityAccessNames');
    this.optionForUserFacility = JSON.parse(facilityAccessNames);
    this.cities = [
      { name: 'change Password', code: 'NY' },
      { name: 'My Profile', code: 'RM' },
      { name: 'logout', code: 'LDN' },
    ];
  }

  showTheChangesForSidebar() {
    console.log('eeeeeee');
    this.extendSidebarClass = 'bigsidebar';
    this.genericResolverHttpClientService.addExtendSidebarClass('bigsidebar');
  }

  logoutUser() {
    // Clear all session and sensitive data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('moduleAccess');
    localStorage.removeItem('facilityAccessNames');
    // Optionally clear everything:
    // localStorage.clear();

    this.toasterService.successToast('Logout Successful');
    this.router.navigateByUrl('/');
  }
}
