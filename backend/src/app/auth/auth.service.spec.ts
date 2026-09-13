import { TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AutoMockingModule } from '../../testing/auto-mocking/auto-mocking.module';
import { AuthModule } from './auth.module';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await AutoMockingModule.createTestingModule({
      imports: [AuthModule],
    });

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
