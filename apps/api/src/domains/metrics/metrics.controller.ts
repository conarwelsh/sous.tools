import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('daily-sales')
  getDailySales() {
    return this.metricsService.getDailySales();
  }

  @Get('avg-ticket-time')
  getAvgTicketTime() {
    return this.metricsService.getAvgTicketTime();
  }

  @Get('open-orders-count')
  getOpenOrdersCount() {
    return this.metricsService.getOpenOrdersCount();
  }

  @Get('longest-open-order')
  getLongestOpenOrder() {
    return this.metricsService.getLongestOpenOrder();
  }
}
