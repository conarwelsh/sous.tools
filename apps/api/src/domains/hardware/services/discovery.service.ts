import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import mdns from 'multicast-dns';
import { logger } from '@sous/logger';
import { config } from '@sous/config';
import os from 'os';

@Injectable()
export class DiscoveryService implements OnModuleInit, OnModuleDestroy {
  private dns = mdns();

  onModuleInit() {
    this.broadcast();
  }

  broadcast() {
    const interfaces = os.networkInterfaces();
    const addresses = Object.values(interfaces)
      .flat()
      .filter((i) => i?.family === 'IPv4' && !i?.internal)
      .map((i) => i?.address);

    logger.info(`📡 Starting Edge Discovery broadcast on: ${addresses.join(', ')}`);

    this.dns.on('query', (query: any) => {
      if (query.questions.some((q: any) => q.name === 'sous-edge.local' || q.name === '_sous-api._tcp.local')) {
        logger.debug('[mDNS] Responding to query for sous-edge.local');
        this.dns.respond({
          answers: [
            {
              name: 'sous-edge.local',
              type: 'A',
              ttl: 300,
              data: addresses[0] || '127.0.0.1',
            },
            {
              name: '_sous-api._tcp.local',
              type: 'SRV',
              data: {
                port: config.api.port,
                target: 'sous-edge.local',
              },
            },
          ],
        });
      }
    });
  }

  onModuleDestroy() {
    this.dns.destroy();
  }
}
