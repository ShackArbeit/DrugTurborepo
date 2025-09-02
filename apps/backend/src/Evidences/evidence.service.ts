import { Injectable,NotFoundException} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Evidence } from "./evidence.entity";
import {Case} from '../Case/case.entity'
import { CreateEvidenceInput,UpdateEvidenceInput } from "./dto/evidence.inputs";

import {del as blobDel} from '@vercel/blob'
import * as path from 'path';
import { promises as fs } from 'fs';


@Injectable()
export class EvidenceService{
     constructor(
         @InjectRepository(Evidence)
         private readonly evidenceRepository:Repository<Evidence>,
         @InjectRepository(Case)
         private readonly caseRepository:Repository<Case>
     ){}
     
     private isVercelBlobUrl(url?:string | null ):boolean{
         if(!url){
            return false
         }
         return /vercel-storage\.com/i.test(url);
     }
     private async deleteVercelBlob(url?:string|null){
           if(!url) return 
           const token = process.env.BLOB_READ_WRITE_TOKEN;
           if(!token){
                console.warn('[deleteVercelBlob] BLOB_READ_WRITE_TOKEN is missing, skip:', url);
                return;
           }
           try{
               await blobDel(url!,{token})
           }catch(err:any){
                console.warn('[deleteVercelBlob] failed:', url, err);
           }
     }
    

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
      });

      const savedEvidence = await this.evidenceRepository.save(newEvidence);

      // 查 relations
      const foundEvidence = await this.evidenceRepository.findOne({
          where: { id: savedEvidence.id},
          relations: ['case'],
      });

      if (!foundEvidence) {
      throw new NotFoundException(`找不到 ID 為 ${savedEvidence.id} 的證物。`);
      }

      return foundEvidence;
}

     // 找尋所有的證物
     async findAllEvidence():Promise<Evidence[]>{
          return this.evidenceRepository.find({relations:['case']})
     }

     // 找尋特定證物
     async findOneEvidence(id:number):Promise<Evidence>{
             const EvidenceItem=await this.evidenceRepository.findOne({
                   where:{id},
                   relations:['case']
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
           const updatedEvidence=this.evidenceRepository.merge(existingEvidence,updateEvidenceInput)
           await this.evidenceRepository.save(updatedEvidence)
          // 🔥 一定要再查 relations
          const foundEvidence=await this.evidenceRepository.findOne({
               where:{id},
               relations:['case']
          })
           if (!foundEvidence) {
             throw new NotFoundException(`更新後查無 ID 為 ${id} 的證物。`);
           }
           return foundEvidence
     }
     // 移除某證物
     async removeEvidence(id:number):Promise<boolean>{
          //  const response=await this.evidenceRepository.delete(id)
          //  return (response.affected??0)>0
          const row = await this.evidenceRepository.findOne({where:{id}})
          if (!row) return false
          const urls = [row.photoFront, row.photoBack, row.photoFront2, row.photoBack2]
          await Promise.all(urls.map((u) => this.deleteVercelBlob(u)))
          const res = await this.evidenceRepository.delete(id)
          return (res.affected ?? 0) > 0

     }
     async findByCaseId(caseId: number): Promise<Evidence[]> {
          return this.evidenceRepository.find({
          where: { case: { id: caseId } }, // 或 where: { caseId }
          order: { createdAt: 'ASC' },     // 可依需求排序
          });
     }

     // 查看特定 caseNumber 所對應的證物數量是多少的
     async countByCaseNumber(caseNumber:string):Promise<number>{
          return this.evidenceRepository.count({where:{case:{caseNumber}}})
     }
}
