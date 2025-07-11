import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Case } from "./case.entity";
import { CaseService } from "./case.service";
import { CaseResolver } from "./case.resolver";

@Module({
      imports: [TypeOrmModule.forFeature([Case])],
      providers: [CaseService, CaseResolver],
})
export class CaseModule {}