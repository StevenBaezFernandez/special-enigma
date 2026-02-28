import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import {
  DomainValidationError,
  InsufficientStockException,
  StockNotFoundError,
  WarehouseNotFoundError,
} from '@virteex/domain-inventory-domain';

@Catch(WarehouseNotFoundError, StockNotFoundError, DomainValidationError, InsufficientStockException)
export class InventoryApplicationExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof WarehouseNotFoundError || exception instanceof StockNotFoundError) {
      response.status(HttpStatus.NOT_FOUND).json({ message: exception.message });
      return;
    }

    if (exception instanceof DomainValidationError || exception instanceof InsufficientStockException) {
      response.status(HttpStatus.BAD_REQUEST).json({ message: exception.message });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
  }
}
