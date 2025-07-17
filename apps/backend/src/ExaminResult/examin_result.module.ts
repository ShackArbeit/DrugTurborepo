import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExaminResult } from "./examin_result.entity";
import { Evidence } from "../Evidences/evidence.entity";
import { ExaminResultService } from "./examin_result.service";
import { ExaminResultResolver  } from "./examin_result.resolver";


@Module({
       imports:[TypeOrmModule.forFeature([ExaminResult,Evidence])],
       providers:[ExaminResultService ,ExaminResultResolver ]
})
export class ExaminResultModule{}