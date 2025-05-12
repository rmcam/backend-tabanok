import { RevokedToken } from '../../auth/entities/revoked-token.entity';
import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed'; 

export class RevokedTokenSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad RevokedToken si es necesario.
    // Dependiendo de la lógica de negocio, puede que no sea necesario poblar tokens revocados
    // durante el seeding inicial.
  }
}
