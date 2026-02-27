import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {

  describe('getData', () => {
    it('should return an operational status payload', () => {
      const appController = new AppController(new AppService());
      expect(appController.getData()).toEqual(
        expect.objectContaining({
          status: 'ok',
        }),
      );
    });
  });
});
