import { Test, TestingModule } from '@nestjs/testing';
import { AccountingService } from './accounting.service';
import { DatabaseService } from '../../core/database/database.service';

const mockDbService = {
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
  },
};

describe('AccountingService', () => {
  let service: AccountingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingService,
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compile();

    service = module.get<AccountingService>(AccountingService);
  });

  it('should generate P&L correctly', async () => {
    const mockLedger = [
      { account: 'Revenue', amount: 1000 },
      { account: 'COGS', amount: 400 },
      { account: 'Revenue', amount: 500 },
    ];

    mockDbService.db.where.mockResolvedValue(mockLedger);

    const pl = await service.generatePL('org1');
    expect(pl.revenue).toBe(1500);
    expect(pl.cogs).toBe(400);
    expect(pl.grossProfit).toBe(1100);
  });
});
