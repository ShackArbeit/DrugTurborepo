import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';
import { ROLES_KEY } from './roles.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';


@Injectable()
export class RolesGuard implements CanActivate{
      constructor(private reflector:Reflector){}

      canActivate(context: ExecutionContext): boolean  {
          const  requiredRoles = this.reflector.getAllAndOverride<Role[]>(
             ROLES_KEY,[
                  context.getHandler(),
                  context.getClass()
             ]
          )
          if(!requiredRoles){
              return true
          }
          const ctx = GqlExecutionContext.create(context)
          const req = ctx.getContext().req
          const user = req.ueser
          if(!user){
               return false
          }
          return requiredRoles.some((role)=>user.role==role)
      }
}