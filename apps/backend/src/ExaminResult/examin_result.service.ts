import { Injectable, NotFoundException,BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExaminResult } from './examin_result.entity';
import { Evidence } from 'src/Evidences/evidence.entity';
import { CreateExaminResultsInput,UpdateExaminResultsInput } from './dto/examin-result.inputs';

@Injectable()
export class ExaminResultService{
    constructor(
            @InjectRepository(ExaminResult)
            private readonly resultRepository: Repository<ExaminResult>,
            @InjectRepository(Evidence)
            private readonly evidenceRrposiory:Repository<Evidence>
    ){}
    
    // 建立查詢結果
    async createResult(input:CreateExaminResultsInput):Promise<ExaminResult>{
            const foundEvidence=await this.evidenceRrposiory.findOne({
                 where:{evidenceNumber:input.evidenceNumber}
            })
            if(!foundEvidence){
                  throw new NotFoundException(`找不到 evidenceNumber 為 ${input.evidenceNumber} 的證物，無法建立鑑識結果。`);
            }
           const existingResult = await this.resultRepository.findOne({
                        where: { evidence_id: foundEvidence.id },
            });
            if (existingResult) {
                throw new BadRequestException(`該證物已經存在鑑識結果，無法重複建立。`,);
           }

            const newResult=this.resultRepository.create({
                 ...input,
                 evidence_id:foundEvidence.id,
            })
            const savedResult=await this.resultRepository.save(newResult)
            // 查 relations
            const  foundResult=await this.resultRepository.findOne({
                  where:{id:savedResult.id},
                  relations:['evidences']
            })
             if (!foundResult) {
               throw new NotFoundException(`找不到 ID 為 ${savedResult.id} 的證物。`);
              }
             return foundResult
         }
   
    // 查詢所有結果
    async findAllResult():Promise<ExaminResult[]>{
         return this.resultRepository.find({relations:['evidences']})
    }

    // 查詢單一結果
    async findOneResult(id:number):Promise<ExaminResult>{
           const ResultItem = await this.resultRepository.findOne(
                { where: { id },
                relations:['evidences']
         });
            if (!ResultItem) throw new NotFoundException(`ExaminResult with id ${id} not found`);
            return ResultItem;
    }
    // 更新結果
    async updateResult(id:number,updateResultInput:UpdateExaminResultsInput):Promise<ExaminResult>{
         const existingResult=await this.resultRepository.findOneBy({id})
         if(!existingResult){
                 throw new NotFoundException(`ID 為 ${id} 的鑑識結果不存在，無法更新。`)
         }
         const updatedResult=this.resultRepository.merge(existingResult,updateResultInput)
         await this.resultRepository.save(updatedResult)
         // 🔥 一定要再查 relations
         const foundResult=await this.resultRepository.findOne({
              where:{id},
              relations:['evidences']
         })
         if(!foundResult){
                 throw new NotFoundException(`更新後查無 ID 為 ${id} 的鑑識結果。`);
         }
         return foundResult
    }

    // 移除結果
      async remove(id: number): Promise<boolean> {
            const response = await this.resultRepository.delete(id);
            return (response.affected ?? 0) > 0;
    }
}