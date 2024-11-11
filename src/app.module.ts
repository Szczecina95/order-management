import { ConfigModule, ConfigService } from 'nestjs-config';
import { resolve } from 'path';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from '@orders/orders.module';
import { ConfigNames } from '@config/config-names.enum';
import { MealsModule } from '@meals/meals.module';
import { CategoriesModule } from '@categories/categories.module';
import { MealsSeederService } from '@meals/meals-seeder/meals-seeder.service';

@Module({
  imports: [
    ConfigModule.load(
      resolve(__dirname, 'config', '**/!(*.d).config.{ts,js}'),
      {
        modifyConfigName: (name) => name.replace('.config', ''),
      },
    ),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: configService.get(ConfigNames.redis),
      }),
      inject: [ConfigService],
    }),
    OrdersModule,
    MealsModule,
    CategoriesModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT as string, 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: ['dist/**/*.entity.js'],
      synchronize: true,
    }),
  ],
  providers: [MealsSeederService],
})
export class AppModule {}
