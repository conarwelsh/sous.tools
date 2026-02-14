import { SetMetadata } from '@nestjs/common';
import { MetricKey } from '@sous/features/constants/plans';

export const CheckUsage = (key: MetricKey) => SetMetadata('metric_key', key);
