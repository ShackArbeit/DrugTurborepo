import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Case } from "./case.entity";
import { Evidence } from "../Evidences/evidence.entity";
import { CaseService } from "./case.service";
import { CaseResolver } from "./case.resolver";
import { EvidenceService } from "../Evidences/evidence.service";

@Module({
      imports: [TypeOrmModule.forFeature([Case,Evidence])],
      providers: [CaseService, CaseResolver,EvidenceService],
})
export class CaseModule {}