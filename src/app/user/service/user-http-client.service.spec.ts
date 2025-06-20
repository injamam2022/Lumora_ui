import { TestBed } from '@angular/core/testing';

import { UserHttpClientService } from './user-http-client.service';

describe('UserHttpClientService', () => {
  let service: UserHttpClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserHttpClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
