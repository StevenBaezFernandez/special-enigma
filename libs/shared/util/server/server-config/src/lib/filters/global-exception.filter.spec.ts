import { vi } from 'vitest';
import { GlobalExceptionFilter } from './global-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalExceptionFilter],
    }).compile();

    filter = module.get<GlobalExceptionFilter>(GlobalExceptionFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should format HttpException correctly', () => {
    const mockJson = vi.fn();
    const mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = vi.fn().mockReturnValue({ status: mockStatus });
    const mockGetRequest = vi.fn().mockReturnValue({ url: '/test' });
    const mockHttpArgumentsHost = {
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    };

    const mockArgumentsHost = {
      switchToHttp: () => mockHttpArgumentsHost,
    } as unknown as ArgumentsHost;

    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
      status: HttpStatus.FORBIDDEN,
      detail: 'Forbidden',
      instance: '/test',
    }));
  });
});
