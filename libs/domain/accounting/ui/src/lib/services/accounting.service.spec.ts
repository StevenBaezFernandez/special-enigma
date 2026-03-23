import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AccountingService } from './accounting.service';

describe('AccountingService', () => {
  let service: AccountingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AccountingService]
    });
    service = TestBed.inject(AccountingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch accounts', () => {
    const mockAccounts = [{ id: '1', code: '101.01', name: 'Cash', type: 'ASSET' }];
    service.getAccounts().subscribe(accounts => {
      expect(accounts.length).toBe(1);
      expect(accounts).toEqual(mockAccounts);
    });

    const req = httpMock.expectOne('/api/accounting/accounts');
    expect(req.request.method).toBe('GET');
    req.flush(mockAccounts);
  });
});
