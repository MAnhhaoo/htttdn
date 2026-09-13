import { AutoMockingModule } from '../../../testing/auto-mocking/auto-mocking.module';
import { ExcelResponseInterceptor } from './excel-response.interceptor';

describe('ExcelResponseInterceptor', () => {
  let interceptor: ExcelResponseInterceptor;

  beforeAll(async () => {
    const app = await AutoMockingModule.createTestingModule({
      providers: [ExcelResponseInterceptor],
    });

    interceptor = await app.resolve(ExcelResponseInterceptor);
  });
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
});
