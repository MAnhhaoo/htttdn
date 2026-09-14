import { AutoMockingModule } from '../../../testing/auto-mocking/auto-mocking.module';
import { AccessControlGuard } from './access-control.guard';
describe('AccessControlGuard', () => {
  let guard: AccessControlGuard;

  beforeAll(async () => {
    const app = await AutoMockingModule.createTestingModule({
      providers: [AccessControlGuard],
    });

    guard = await app.resolve<AccessControlGuard>(AccessControlGuard);
  });
  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
