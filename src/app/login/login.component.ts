import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { LoginHttpClientService } from './service/login-http-client.service';
import { LoginUserPayload } from './interface/login-user.interface';
import { ToasterService } from '../shared/services/toaster.service';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { CheckModuleAccessService } from '../shared/services/check-module-access.service';

interface City {
  name: string;
  code: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    PasswordModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    ToastModule,
    MessagesModule,
    DropdownModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  public loginUser: LoginUserPayload = {
    email_id: '',
    password: '',
  };

  cities: City[] | undefined;

  selectedCity: City | undefined;

  public constructor(
    public loginHttpClientService: LoginHttpClientService,
    public toasterService: ToasterService,
    public router: Router,
    public checkModuleAccessService: CheckModuleAccessService
  ) {}

  ngOnInit() {
    this.cities = [
      { name: 'New York', code: 'NY' },
      { name: 'Rome', code: 'RM' },
      { name: 'London', code: 'LDN' },
      { name: 'Istanbul', code: 'IST' },
      { name: 'Paris', code: 'PRS' },
    ];
  }

  public onSubmitLoginCheck() {
    this.loginHttpClientService
      .loginUser(this.loginUser)
      .subscribe((response) => {
        if (response.stat === 400) {
          this.toasterService.errorToast(response.msg);
        } else if (response.stat === 200) {
          localStorage.setItem('authToken', 'authenticated');
          localStorage.setItem('userData', JSON.stringify(response.all_list));
          // Fetch module access for the user's role
          const roleId = response.all_list.role_id;
          this.checkModuleAccessService
            .getModuleRespectToRole(roleId)
            .subscribe((moduleResponse) => {
              // Store module access in localStorage
              localStorage.setItem('moduleAccess', JSON.stringify(moduleResponse.All_list));
              // Now navigate to dashboard
              this.router.navigateByUrl('/dashboard');
              this.toasterService.successToast('Login Successful');
            });
        }
      });
  }
}
