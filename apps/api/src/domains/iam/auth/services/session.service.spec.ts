import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service.js';
import Redis from 'ioredis';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    return {
      set: jest.fn(),
      get: jest.fn(),
    };
  });
});

describe('SessionService', () => {
  let service: SessionService;
  let redis: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionService],
    }).compile();

    service = module.get<SessionService>(SessionService);
    // @ts-expect-error - Accessing private redis for testing
    service.redis = new Redis();
    // @ts-expect-error - Accessing private redis for testing
    redis = service.redis;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('revokeToken', () => {
    it('should set the token in redis with TTL', async () => {
      const jti = 'test-jti';
      const exp = Math.floor(Date.now() / 1000) + 3600;

      await service.revokeToken(jti, exp);
      expect(redis.set).toHaveBeenCalledWith(
        `revoked_token:${jti}`,
        '1',
        'EX',
        expect.any(Number),
      );
    });
  });

  describe('isTokenRevoked', () => {
    it('should return true if token is in redis', async () => {
      redis.get.mockResolvedValue('1');
      const result = await service.isTokenRevoked('revoked-jti');
      expect(result).toBe(true);
    });

    it('should return false if token is not in redis', async () => {
      redis.get.mockResolvedValue(null);
      const result = await service.isTokenRevoked('valid-jti');
      expect(result).toBe(false);
    });
  });
});
