import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ExaminResult } from './examin_result.entity';
import { ExaminResultService } from './examin_result.service';
import { CreateExaminResultsInput,UpdateExaminResultsInput } from './dto/examin-result.inputs';

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

   @Mutation(() => ExaminResult, { description: '建立新檢測結果' })
            createExaminResult(
            @Args('input') input: CreateExaminResultsInput,
            ): Promise<ExaminResult> {
            return this.resultService.createResult(input);
    }

  @Mutation(() => ExaminResult, { description: '更新指定檢測結果' })
  updateExaminResult(
      @Args('id', { type: () => Int, description: '檢測結果 ID' }) id: number,
      @Args('input') input: UpdateExaminResultsInput,
      ): Promise<ExaminResult> {
      return this.resultService.updateResult(id, input);
  }

  @Mutation(() => Boolean, { description: '刪除指定檢測結果' })
      removeExaminResult(
      @Args('id', { type: () => Int, description: '檢測結果 ID' }) id: number,
      ): Promise<boolean> {
      return this.resultService.remove(id);
  }
}