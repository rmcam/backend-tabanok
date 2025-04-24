import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RevokedToken } from '../entities/revoked-token.entity';

@Injectable()
export class RevokedTokenRepository extends Repository<RevokedToken> {
  constructor(private dataSource: DataSource) {
    super(RevokedToken, dataSource.createEntityManager());
  }
}
