import {  Injectable,NotFoundException,BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PickUp } from "./pickup.entity";
import { Evidence } from "../Evidences/evidence.entity";
import { CreatePickupInput,UpdatePickupInput} from "./dto/pickup.input";

@Injectable()
export class PickupService{
      constructor(
            @InjectRepository(PickUp)
            private readonly pickupRepository:Repository<PickUp>,    
            @InjectRepository(Evidence)  
            private readonly evidenceRepository:Repository<Evidence>
      ){}
      // 建立領回資料
      async createPick(input:CreatePickupInput){
            const foundEvidence=await this.evidenceRepository.findOne({
                    where:{evidenceNumber:input.evidence_number}
            })
            if(!foundEvidence){
               throw new NotFoundException(`找不到 evidenceNumber 為 ${input.evidence_number} 的證物，無法建立鑑識結果。`)
            }
            const existingPickup=await this.pickupRepository.findOne({
                    where:{evidence_id:foundEvidence.id}
            })
            if(existingPickup){
                  throw new BadRequestException('該證物已經存在領回紀錄，無法重複建立。')
            }
            const newPickup=this.pickupRepository.create({
                    ...input,
                    evidence_id:foundEvidence.id
            })
            const savedPickup=await this.pickupRepository.save(newPickup)
            // 查 relations
            const foundPickup=await this.pickupRepository.findOne({
                   where:{id:savedPickup.id},
                   relations:['evidences']
            })
            if(!foundPickup){
                  throw new NotFoundException(`找不到 ID 為 ${savedPickup.id} 的領回紀錄。`)
            }
            return foundPickup
      }
      // 查詢所有領回資料
      async findAllPickup():Promise<PickUp[]>{
            return this.pickupRepository.find({relations:['evidences']})
      }

      // 查詢單一領回資料
      async findOnePickup(id:number):Promise<PickUp>{
           const PickupItem=await this.pickupRepository.findOne({
                   where:{id},
                   relations:['evidences']
           })
           if(!PickupItem){
                throw new NotFoundException(`PickupResult with id ${id} not found`)
           }
           return PickupItem
      }

      // 更新領回資料
      async updatePick(id:number,updatePickUpInput:UpdatePickupInput):Promise<PickUp>{
           const existingPickup=await this.pickupRepository.findOneBy({id})
           if(!existingPickup){
               throw new NotFoundException(`ID 為 ${id} 的領回紀錄不存在，無法更新。`)
           }
           const updatedPickup=this.pickupRepository.merge(existingPickup,updatePickUpInput)
           await this.pickupRepository.save(updatedPickup)
           // 🔥 一定要再查 relations
           const foundPickup=await this.pickupRepository.findOne({
                where:{id},
                relations:['evidences']
           })
           if(!foundPickup){
               throw new NotFoundException(`更新後查無 ID 為 ${id} 的領回紀錄。`);
           }
           return foundPickup
      }
      // 刪除領回資料
      async removePick(id:number):Promise<boolean>{
            const response=await this.pickupRepository.delete(id)
            return (response.affected??0)>0
      }
      
}



