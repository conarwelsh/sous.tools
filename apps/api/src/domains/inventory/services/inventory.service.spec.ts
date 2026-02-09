import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { DatabaseService } from '../../core/database/database.service';

const mockDbService = {
  db: {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: '1' }]),
  },
};

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should record depletion as negative amount', async () => {
    await service.depleteStock('org1', 'loc1', 'ing1', 50);
    expect(mockDbService.db.values).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: -50,
        type: 'sale',
      }),
    );
  });
});
