import { Injectable,NotFoundException} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Evidence } from "./evidence.entity";
import { Case } from "src/Case/case.entity";
import { CreateEvidenceInput,UpdateEvidenceInput } from "./dto/evidence.inputs";

@Injectable()
export class EvidenceService{
     constructor(
         @InjectRepository(Evidence)
         private readonly evidenceRepository:Repository<Evidence>,
         @InjectRepository(Case)
         private readonly caseRepository:Repository<Case>
     ){}
     // 建立新證物
     async createEvidence(input: CreateEvidenceInput): Promise<Evidence> {
      const foundCase = await this.caseRepository.findOne({
         where: { caseNumber: input.caseNumber },
      });

      if (!foundCase) {
      throw new NotFoundException(`找不到 caseNumber 為 ${input.caseNumber} 的案件，無法建立證物。`);
      }

      const newEvidence = this.evidenceRepository.create({
      ...input,
      caseId: foundCase.id,
      createdAt: new Date().toISOString(),
      });

      const savedEvidence = await this.evidenceRepository.save(newEvidence);

      // 查 relations
      const foundEvidence = await this.evidenceRepository.findOne({
      where: { id: savedEvidence.id },
      relations: ['case'],
      });

      if (!foundEvidence) {
      throw new NotFoundException(`找不到 ID 為 ${savedEvidence.id} 的證物。`);
      }

      return foundEvidence;
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
