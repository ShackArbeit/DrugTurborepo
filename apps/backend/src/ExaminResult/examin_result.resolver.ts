import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../Auth/gql-auth.guard';
import { RolesGuard } from '../Auth/role/roles.guard';
import { Roles } from '../Auth/role/roles.decorator';
import { Role } from '../Auth/role/role.enum';
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ExaminResult } from './examin_result.entity';
import { ExaminResultService } from './examin_result.service';
import { CreateExaminResultsInput,UpdateExaminResultsInput } from './dto/examin-result.inputs';

@Resolver(()=>ExaminResult)
export class ExaminResultResolver {
    constructor(private readonly resultService:ExaminResultService){}

    @Query(() => [ExaminResult], { name: 'examinResults', description: '取得所有檢測結果' })
    findAll(): Promise<ExaminResult[]> {
      return this.resultService.findAllResult()
    }
      @Query(() => ExaminResult, { name: 'examinResult', description: '依 ID 取得單一檢測結果' })
            findOne(
            @Args('id', { type: () => Int, description: '檢測結果 ID' }) id: number,
            ): Promise<ExaminResult> {
            return this.resultService.findOneResult(id);
      }

   @UseGuards(GqlAuthGuard,RolesGuard)
   @Roles(Role.Admin)
   @Mutation(() => ExaminResult, { description: '建立新檢測結果' })
            createExaminResult(
            @Args('input') input: CreateExaminResultsInput,
            ): Promise<ExaminResult> {
            return this.resultService.createResult(input);
    }

  @UseGuards(GqlAuthGuard,RolesGuard)
  @Roles(Role.Admin)
  @Mutation(() => ExaminResult, { description: '更新指定檢測結果' })
  updateExaminResult(
      @Args('id', { type: () => Int, description: '檢測結果 ID' }) id: number,
      @Args('input') input: UpdateExaminResultsInput,
      ): Promise<ExaminResult> {
      return this.resultService.updateResult(id, input);
  }

  @UseGuards(GqlAuthGuard,RolesGuard)
  @Roles(Role.Admin)
  @Mutation(() => Boolean, { description: '刪除指定檢測結果' })
      removeExaminResult(
      @Args('id', { type: () => Int, description: '檢測結果 ID' }) id: number,
      ): Promise<boolean> {
      return this.resultService.remove(id);
  }
}