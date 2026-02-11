import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  getDailySales() {
    return { value: 1234.56, unit: 'USD' };
  }

  getAvgTicketTime() {
    return { value: 330, unit: 'seconds' };
  }

  getOpenOrdersCount() {
    return { value: 5 };
  }

  getLongestOpenOrder() {
    return { orderId: '12', duration: 900, unit: 'seconds' };
  }
}
