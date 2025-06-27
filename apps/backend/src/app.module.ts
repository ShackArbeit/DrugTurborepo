import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver,ApolloDriverConfig } from '@nestjs/apollo';
import {join} from 'path';


@Module({
  imports: [
    // GraphQL 模組設定 (Code First)
    GraphQLModule.forRoot<ApolloDriverConfig>({
         driver:ApolloDriver,
         playground: true,
         autoSchemaFile:join(process.cwd(),'apps/backend/src/schema.gql'),
         sortSchema: true,
    }),
    // TypeORM 模組設定 (SQLite 資料庫)
    TypeOrmModule.forRoot({
        type:'sqlite',
        database:join(process.cwd(),'apps/backend/db.sqlite'),
        synchronize:true,  // 自動同步資料庫結構 
        autoLoadEntities:true // 自動載入實體
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
