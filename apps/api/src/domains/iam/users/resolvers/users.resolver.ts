import { ObjectType, Field, ID, Resolver, Query, Args } from '@nestjs/graphql';
import { UsersService } from '../services/users.service.js';

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field()
  role: string;

  @Field()
  organizationId: string;
}

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserType, { nullable: true })
  async user(@Args('id') id: string) {
    return this.usersService.findById(id);
  }
}
