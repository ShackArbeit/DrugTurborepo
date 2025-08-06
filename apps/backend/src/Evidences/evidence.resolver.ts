import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../Auth/gql-auth.guard';
import { RolesGuard } from '../Auth/role/roles.guard';
import { Roles } from '../Auth/role/roles.decorator';
import { Role } from '../Auth/role/role.enum';
import { Resolver,Query,Mutation,Args,Int } from "@nestjs/graphql";
import { EvidenceService } from "./evidence.service";
import { Evidence } from "./evidence.entity";
import { CreateEvidenceInput,UpdateEvidenceInput } from "./dto/evidence.inputs";

@Resolver(()=>Evidence)
export class EvidenceResolver{
      constructor(private readonly evidenceService:EvidenceService){}

      @Query(()=>[Evidence],{ name: 'evidences', description: '取得所有證物' })
      findAll():Promise<Evidence[]>{
           return this.evidenceService.findAllEvidence()
      }

      @Query(() => Evidence, { name: 'evidence', description: '依 ID 取得單一證物' })
            findOne(
            @Args('id', { type: () => Int, description: '證物 ID' }) id: number,
            ): Promise<Evidence> {
            return this.evidenceService.findOneEvidence(id)
      }
     
      @UseGuards(GqlAuthGuard,RolesGuard)
      @Roles(Role.Admin)
      @Mutation(() => Evidence, { description: '建立新證物' })
      createEvidence(@Args('input') input:CreateEvidenceInput):Promise<Evidence>{
             return this.evidenceService.createEvidence(input)
      }

      @UseGuards(GqlAuthGuard,RolesGuard)
      @Roles(Role.Admin)
      @Mutation(() => Evidence, { description: '更新指定證物' })
      updateEvidence(@Args('input') input:UpdateEvidenceInput,
                      @Args('id',{type:()=>Int,description:'證物 ID'}) id:number):Promise<Evidence> 
                      {
            return this.evidenceService.updateEvidence(id,input)
      }

      @UseGuards(GqlAuthGuard,RolesGuard)
      @Roles(Role.Admin)
      @Mutation(() => Boolean, { description: '刪除指定證物' })
      removeEvidence(@Args('id',{type:()=>Int,description: '證物 ID'}) id:number):Promise<boolean>{
            return this.evidenceService.removeEvidence(id)
      }

}
