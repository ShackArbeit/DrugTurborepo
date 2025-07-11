import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Evidence } from "./evidence.entity";
import { Case } from "src/Case/case.entity";
import { EvidenceService } from "./evidence.service";
import { EvidenceResolver } from "./evidence.resolver";

@Module({
    imports: [TypeOrmModule.forFeature([Evidence, Case])],
    providers: [EvidenceService, EvidenceResolver],
})
export class EvidenceModule {}
