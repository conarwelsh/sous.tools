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
import { PresentationService } from '../services/presentation.service.js';

@ObjectType()
export class TemplateType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  structure: string; // JSON string

  @Field()
  isSystem: boolean;
}

@ObjectType()
export class DisplayType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  resolution?: string;

  @Field({ nullable: true })
  orientation?: string;
}

@InputType()
export class CreateTemplateInput {
  @Field()
  name: string;

  @Field()
  structure: string;
}

@InputType()
export class CreateDisplayInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  resolution?: string;

  @Field({ nullable: true })
  orientation?: string;
}

@Resolver()
export class PresentationResolver {
  constructor(private readonly presentationService: PresentationService) {}

  @Query(() => [TemplateType])
  async templates(@Args('orgId') orgId: string) {
    return this.presentationService.getTemplates(orgId);
  }

  @Query(() => [DisplayType])
  async displays(@Args('orgId') orgId: string) {
    return this.presentationService.getDisplays(orgId);
  }

  @Mutation(() => TemplateType)
  async createTemplate(
    @Args('orgId') orgId: string,
    @Args('input') input: CreateTemplateInput,
  ) {
    return this.presentationService.createLayout({
      ...input,
      type: 'TEMPLATE',
      organizationId: orgId,
      isSystem: false,
    });
  }

  @Mutation(() => DisplayType)
  async createDisplay(
    @Args('orgId') orgId: string,
    @Args('input') input: CreateDisplayInput,
  ) {
    return this.presentationService.createDisplay({
      ...input,
      organizationId: orgId,
    });
  }
}
