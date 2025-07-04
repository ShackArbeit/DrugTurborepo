import { Resolver,Query,Mutation,Args,Int} from "@nestjs/graphql";
import { Case } from "./case.entity";
import { CaseService } from "./case.service";
import { CreateCaseInput,UpdateCaseInput } from "./dto/case.inputs";

@Resolver(()=>Case)
export class CaseResolver{
      constructor(private readonly caseService:CaseService){}
   
      @Query(()=>[Case],{name:'cases'})
      findAll():Promise<Case[]>{
            return this.caseService.findAll()
      }
      @Query(()=>Case,{name:'case'})
      findOne(@Args('id',{type:()=>Int}) id:number):Promise<Case>{
            return this.caseService.findOne(id)
      }
      @Mutation(()=>Case)
      createCase(@Args('input') input:CreateCaseInput):Promise<Case>{
           return this.caseService.createCase(input)
      }

      @Mutation(()=>Case)
      updateCase(
            @Args('id',{type:()=>Int}) id:number,
            @Args('input') input:UpdateCaseInput
      ):Promise<Case>{
          return this.caseService.update(id,input)
      }

      @Mutation(()=>Boolean)
      removeCase(@Args('id',{type:()=>Int}) id:number){
          return this.caseService.remove(id)
      }

}