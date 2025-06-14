import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../shared/services/base-http.client.service';
import {
  LoginUserPayload,
  LoginUserResponse,
} from '../interface/login-user.interface';

@Injectable({
  providedIn: 'root',
})
export class LoginHttpClientService {
  private isAuthenticated = false;

  constructor(private readonly baseHttpService: BaseHttpService) {}

  public loginUser(
    payloadLogin: LoginUserPayload
  ): Observable<LoginUserResponse> {
    const loginResponse = this.baseHttpService.post<LoginUserResponse>(
      'General/User_login',
      payloadLogin
    );
    return loginResponse;
  }

  public isAuthenticatedUser(): boolean {
    const loginId = localStorage.getItem('authToken');
    if (loginId) {
      return true;
    }

    return false;
  }
}
