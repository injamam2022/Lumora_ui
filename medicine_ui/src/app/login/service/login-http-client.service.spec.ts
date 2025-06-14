import { TestBed } from '@angular/core/testing';

import { LoginHttpClientService } from './login-http-client.service';

describe('LoginHttpClientService', () => {
  let service: LoginHttpClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginHttpClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
