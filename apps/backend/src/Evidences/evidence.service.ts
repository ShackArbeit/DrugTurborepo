import { Injectable,NotFoundException} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Evidence } from "./evidence.entity";
import { CreateEvidenceInput,UpdateEvidenceInput } from "./dto/evidence.inputs";

@Injectable()
export class EvidenceService{
     constructor(
         @InjectRepository(Evidence)
         private readonly evidenceRepository:Repository<Evidence>
     ){}
     // 建立新證物
     async createEvidence(input:CreateEvidenceInput):Promise<Evidence>{
           const newEvidence=this.evidenceRepository.create(input)
           return this.evidenceRepository.save(newEvidence)
     }
     // 找尋所有的證物
     async findAllEvidence():Promise<Evidence[]>{
          return this.evidenceRepository.find({relations:['case','examinResult']})
     }

     // 找尋特定證物
     async findOneEvidence(id:number):Promise<Evidence>{
             const EvidenceItem=await this.evidenceRepository.findOne({
                   where:{id},
                   relations:['case','examinResult']
             })
             if(!EvidenceItem){
                    throw new NotFoundException(`Evidence with id ${id} not found`)
             }
             return EvidenceItem
     }
     // 更新某證物
     async updateEvidence(id:number,updateEvidenceInput:UpdateEvidenceInput):Promise<Evidence>{
           const existingEvidence=await this.evidenceRepository.findOneBy({id})
           if(!existingEvidence){
                throw new NotFoundException(`ID 為 ${id} 的證物不存在，無法更新。`)
           }
           const updateEvidence=this.evidenceRepository.merge(existingEvidence,updateEvidenceInput)
           return this.evidenceRepository.save(updateEvidence)
     }
     // 移除某證物
     async removeEvidence(id:number):Promise<boolean>{
           const response=await this.evidenceRepository.delete(id)
           return (response.affected??0)>0
     }
}
