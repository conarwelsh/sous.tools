import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { DatabaseService } from '../../../domains/core/database/database.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let dbService: DatabaseService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-1',
    email: 'test@sous.tools',
    passwordHash: 'hashed_password',
    organizationId: 'org-1',
    role: 'admin',
  };

  const mockDb = {
    query: {
      users: {
        findFirst: jest.fn(),
      },
      organizations: {
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    transaction: jest.fn().mockImplementation((cb: any) => cb(mockDb)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: { db: mockDb },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    dbService = module.get<DatabaseService>(DatabaseService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if validation succeeds', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@sous.tools',
        'password123',
      );
      expect(result).toEqual({
        id: 'user-1',
        email: 'test@sous.tools',
        organizationId: 'org-1',
        role: 'admin',
      });
    });

    it('should return null if user not found', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(null);
      const result = await service.validateUser(
        'none@sous.tools',
        'password123',
      );
      expect(result).toBeNull();
    });

    it('should return null if password mismatch', async () => {
      mockDb.query.users.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@sous.tools',
        'wrong_pass',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token', async () => {
      const result = await service.login(mockUser);
      expect(result).toHaveProperty('access_token');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });
});
