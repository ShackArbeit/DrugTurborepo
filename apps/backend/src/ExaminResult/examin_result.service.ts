import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExaminResult } from './examin_result.entity';
import { CreateExaminResultsInput,UpdateExaminResultsInput } from './dto/examin-result.inputs';

@Injectable()
export class ExaminResultService{
    constructor(
            @InjectRepository(ExaminResult)
            private readonly resultRepository: Repository<ExaminResult>,
    ){}
    
    // 建立查詢結果
    async createResult(input:CreateExaminResultsInput):Promise<ExaminResult>{
            const newResult=this.resultRepository.create(input)
            return this.resultRepository.save(newResult)
    }
   
    // 查詢所有結果
    async findAllResult():Promise<ExaminResult[]>{
         return this.resultRepository.find({relations:['evidences']})
    }

    // 查詢單一結果
    async findOneResult(id:number):Promise<ExaminResult>{
           const ResultItem = await this.resultRepository.findOne({ where: { id } });
            if (!ResultItem) throw new NotFoundException(`ExaminResult with id ${id} not found`);
            return ResultItem;
    }

    // 更新結果
    async updateResult(id:number,updateResultInput:UpdateExaminResultsInput):Promise<ExaminResult>{
        const existingResult=await this.resultRepository.findOneBy({id})
        if(!existingResult){
              throw new NotFoundException(`ID 為 ${id} 的結果不存在，無法更新。`)
        }
        const updateResult=await this.resultRepository.merge(existingResult,updateResultInput)
        return updateResult
    }

    // 移除結果
      async remove(id: number): Promise<boolean> {
            const response = await this.resultRepository.delete(id);
            return (response.affected ?? 0) > 0;
    }
}