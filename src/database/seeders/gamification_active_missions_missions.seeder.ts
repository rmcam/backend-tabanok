import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';

export class GamificationActiveMissionsMissionsSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        console.log('Running GamificationActiveMissionsMissionsSeeder...');
        console.log('GamificationActiveMissionsMissions seeder finished.');
    }
}