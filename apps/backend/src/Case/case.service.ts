import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Case } from "./case.entity";
import { CreateCaseInput,UpdateCaseInput } from "./dto/case.inputs";

@Injectable()
export class CaseService{
      constructor(
            @InjectRepository(Case)
            private readonly caseRepository:Repository<Case> 
      ){}
      // 建立新案件 
      async createCase(CaseInput:CreateCaseInput):Promise<Case>{
            const newCase=this.caseRepository.create(CaseInput)
            return this.caseRepository.save(newCase)
      }
      // 查詢所有案件（含其關聯 evidences）
      async findAll():Promise<Case[]>{
             return this.caseRepository.find({relations:['evidences']})
      }
      // 查詢單一案件（含其關聯 evidences）
        async findOne(id: number): Promise<Case> {
            const singleCase = await this.caseRepository.findOne({
                  where: { id },
                  relations: ['evidences'],
      });
            if (!singleCase) throw new NotFoundException(`Case with id ${id} not found`);
            return singleCase;
      }
      // 更新某案件
      async update(id:number,updateCaseInput:UpdateCaseInput):Promise<Case>{
            const existingCase=await this.caseRepository.findOneBy({id})
            if(!existingCase){
                  throw new NotFoundException(`ID 為 ${id} 的案件不存在，無法更新。`);
            }
            const updateCase=this.caseRepository.merge(existingCase,updateCaseInput)
            return this.caseRepository.save(updateCase)
      }
      // 刪除某案件
      async remove(id:number):Promise<boolean>{
            const response=await this.caseRepository.delete(id)
            return (response.affected ?? 0) > 0;
      }

}