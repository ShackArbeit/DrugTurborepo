import {  Injectable,NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PickUp } from "./pickup.entity";
import { CreatePickupInput,UpdatePickupInput} from "./dto/pickup.input";

@Injectable()
export class PickupService{
      constructor(
            @InjectRepository(PickUp)
            private readonly pickupRepository:Repository<PickUp>,      
      ){}
      // 查詢所有領回資料
      async findAllPickup():Promise<PickUp[]>{
            return this.pickupRepository.find({relations:['case']})
      }

      // 查詢單一領回資料
      async findOnePickup(id:number):Promise<PickUp>{
           const pickupItem=await this.pickupRepository.findOne({
                where:{id},
                relations:['case']
           })
           if(!pickupItem){
               throw new NotFoundException(`Pickup with ID ${id} not found`)
           }
           return pickupItem
      }

      // 建立領回資料
      async createPick(input:CreatePickupInput){
            const newPick=this.pickupRepository.create(input)
            return this.pickupRepository.save(newPick)
      }

      // 更新領回資料
      async updatePick(id:number,updatePickUpInput:UpdatePickupInput):Promise<PickUp>{
           const existingPickup=await this.pickupRepository.findOneBy({id})
           if(!existingPickup){
              throw new NotFoundException(`ID 為 ${id} 的領回資料不存在，無法更新。`)
           }
           const updatePickup=this.pickupRepository.merge(existingPickup,updatePickUpInput)
           return this.pickupRepository.save(updatePickup)
      }
      // 刪除領回資料
      async removePick(id:number):Promise<boolean>{
            const response=await this.pickupRepository.delete(id)
            return (response.affected??0)>0
      }
      
}



