import { Test, TestingModule } from '@nestjs/testing';
import { RemoteConfigService } from './remote-config.service';
import { DatabaseService } from '../../core/database/database.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';

const mockDbService = {
  db: {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
  },
};

const mockGateway = {
  emitToHardware: jest.fn(),
};

describe('RemoteConfigService', () => {
  let service: RemoteConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoteConfigService,
        { provide: DatabaseService, useValue: mockDbService },
        { provide: RealtimeGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<RemoteConfigService>(RemoteConfigService);
  });

  it('should push config updates', async () => {
    await service.updateConfig('hw1', { brightness: 100 });
    expect(mockDbService.db.update).toHaveBeenCalled();
    expect(mockGateway.emitToHardware).toHaveBeenCalledWith(
      'hw1',
      'config:update',
      { brightness: 100 }
    );
  });
});
