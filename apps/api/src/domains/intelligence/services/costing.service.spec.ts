import { Test, TestingModule } from '@nestjs/testing';
import { CostingService } from './costing.service';
import { DatabaseService } from '../../core/database/database.service';

const mockDbService = {
  db: {
    query: {
      recipes: {
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
  },
};

describe('CostingService', () => {
  let service: CostingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CostingService,
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compile();

    service = module.get<CostingService>(CostingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate cost correctly', async () => {
    const recipeId = 'r1';
    const orgId = 'o1';

    mockDbService.db.query.recipes.findFirst.mockResolvedValue({
      id: recipeId,
      organizationId: orgId,
      name: 'Test Recipe',
      ingredients: [
        {
          amount: 10,
          ingredient: { currentPrice: 50 }, // 10 * 50 = 500
        },
        {
          amount: 2,
          ingredient: { currentPrice: 100 }, // 2 * 100 = 200
        },
      ],
    });

    const cost = await service.calculateRecipeCost(recipeId, orgId);
    expect(cost).toBe(700);
    expect(mockDbService.db.insert).toHaveBeenCalled();
  });
});
