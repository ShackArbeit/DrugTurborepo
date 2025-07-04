import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExaminResult } from "./examin_result.entity";
import { ExaminResultService } from "./examin_result.service";
import { ExaminResultResolver  } from "./examin_result.resolver";

@Module({
       imports:[TypeOrmModule.forFeature([ExaminResult])],
       providers:[ExaminResultService ,ExaminResultResolver ]
})
export class ExaminResultModule{}