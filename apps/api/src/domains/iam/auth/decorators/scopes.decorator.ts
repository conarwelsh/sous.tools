import { SetMetadata } from '@nestjs/common';
import { FeatureScope } from '@sous/features/constants/plans';

export const Scopes = (...scopes: FeatureScope[]) => SetMetadata('scopes', scopes);
