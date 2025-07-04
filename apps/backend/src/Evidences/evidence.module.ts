import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Evidence } from "./evidence.entity";
import { EvidenceService } from "./evidence.service";
import { EvidenceResolver } from "./evidence.resolver";

@Module({
      imports:[TypeOrmModule.forFeature([Evidence])],
      providers:[EvidenceService,EvidenceResolver],
})
export class EvidenceModule{}