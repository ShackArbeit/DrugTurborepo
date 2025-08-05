
import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {GraphQLModule} from '@nestjs/graphql'
import { ApolloDriver,ApolloDriverConfig } from '@nestjs/apollo';
import {join} from 'path';
import { CaseModule } from './Case/case.module';
import { EvidenceModule } from './Evidences/evidence.module';
import { ExaminResultModule } from './ExaminResult/examin_result.module';
import { PickupModule } from './Pickup/pickup.module';

@Module({
  imports: [
    // GraphQL 模組設定 (Code First)
    GraphQLModule.forRoot<ApolloDriverConfig>({
         driver:ApolloDriver,
         playground: true,
         autoSchemaFile:join(process.cwd(),'./schema.gql'),
         sortSchema: true,
         context: ({ req, res }) => ({ req, res }),
    }),
    // TypeORM 模組設定 (SQLite 資料庫)
    TypeOrmModule.forRoot({
        type:'sqlite',
        database:join(process.cwd(),'./db.sqlite'),
        synchronize:true,  // 自動同步資料庫結構 
        autoLoadEntities:true // 自動載入實體
    }),
    CaseModule,
    EvidenceModule,
    ExaminResultModule,
    PickupModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
