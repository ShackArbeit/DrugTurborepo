import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { Case } from './case.entity';
import { CaseService } from './case.service';
import { Evidence } from '../Evidences/evidence.entity';
import { EvidenceService } from '../Evidences/evidence.service';
import { CreateCaseInput, UpdateCaseInput } from './dto/case.inputs';

@Resolver(() => Case)
export class CaseResolver {
  constructor(
    private readonly caseService: CaseService,
    private readonly evidenceService: EvidenceService, // 取得關聯證物用
  ) {}

  /** 取得所有案件 */
  @Query(() => [Case], { name: 'cases' })
  findAll(): Promise<Case[]> {
    return this.caseService.findAll();
  }

  /** 取得單一案件 */
  @Query(() => Case, { name: 'case' })
  findOne(@Args('id', { type: () => Int }) id: number): Promise<Case> {
    return this.caseService.findOne(id);
  }

  /** 建立案件 */
  @Mutation(() => Case)
  createCase(@Args('input') input: CreateCaseInput): Promise<Case> {
    return this.caseService.createCase(input);
  }

  /** 更新案件 */
  @Mutation(() => Case)
  updateCase(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateCaseInput,
  ): Promise<Case> {
    return this.caseService.update(id, input);
  }

  /** 刪除案件 */
  @Mutation(() => Boolean)
  removeCase(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    return this.caseService.remove(id);
  }

  @ResolveField(() => [Evidence])
  async evidences(@Parent() c: Case): Promise<Evidence[]> {
    const list = await this.evidenceService.findByCaseId(c.id);
    return Array.isArray(list) ? list : [];
  }
}
