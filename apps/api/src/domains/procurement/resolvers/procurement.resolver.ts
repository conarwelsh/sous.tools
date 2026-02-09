import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
  ID,
  InputType,
} from '@nestjs/graphql';
import { ProcurementService } from '../services/procurement.service.js';

@ObjectType()
export class SupplierType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  status?: string;
}

@InputType()
export class CreateSupplierInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;
}

@Resolver(() => SupplierType)
export class ProcurementResolver {
  constructor(private readonly procurementService: ProcurementService) {}

  @Query(() => [SupplierType])
  async suppliers(@Args('orgId') orgId: string) {
    return this.procurementService.getSuppliers(orgId);
  }

  @Mutation(() => SupplierType)
  async createSupplier(
    @Args('orgId') orgId: string,
    @Args('input') input: CreateSupplierInput,
  ) {
    return this.procurementService.createSupplier({
      ...input,
      organizationId: orgId,
    });
  }
}
