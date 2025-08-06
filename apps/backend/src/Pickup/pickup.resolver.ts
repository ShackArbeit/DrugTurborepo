import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../Auth/gql-auth.guard';
import { RolesGuard } from '../Auth/role/roles.guard';
import { Roles } from '../Auth/role/roles.decorator';
import { Role } from '../Auth/role/role.enum';
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PickUp } from './pickup.entity';
import { PickupService } from './pickup.service';
import { CreatePickupInput,UpdatePickupInput } from './dto/pickup.input';

@Resolver(() => PickUp)
export class PickupResolver{
       constructor(private readonly pickupService: PickupService) {}

       @Query(() => [PickUp],{ name: 'pickups', description: '取得所有領回紀錄' })
       async findAllPickupResult():Promise<PickUp[]>{
            return this.pickupService.findAllPickup()
       }

       @Query(() => PickUp,{ name: 'pickup', description: '依 ID 取得單一領回紀錄' })
       async findOnePickupResult(@Args('id', { type: () => Int }) id: number):Promise<PickUp>{
            return this.pickupService.findOnePickup(id)
       }

       @UseGuards(GqlAuthGuard,RolesGuard)
       @Roles(Role.Admin)
       @Mutation(() => PickUp)
       async createPickup(@Args('input') input: CreatePickupInput):Promise<PickUp>{
             return this.pickupService.createPick(input)
       }   

      @UseGuards(GqlAuthGuard,RolesGuard)
      @Roles(Role.Admin)
      @Mutation(() => PickUp)
      async updatePickup(
             @Args('id', { type: () => Int }) id: number,
             @Args('input') input: UpdatePickupInput,
      ):Promise<PickUp>{
            return this.pickupService.updatePick(id,input)
      }
      
      @UseGuards(GqlAuthGuard,RolesGuard)
      @Roles(Role.Admin)
      @Mutation(() => Boolean)
      async removePickup(@Args('id', { type: () => Int }) id: number):Promise<boolean>{
           return this.pickupService.removePick(id)
      }
}
