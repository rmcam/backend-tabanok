import { Command, CommandRunner } from 'nest-commander';
import { ContentVersionSeeder } from '../seeds/content-version.seed';

@Command({
    name: 'seed:content',
    description: 'Genera datos de prueba para el sistema de calificación'
})
export class SeedCommand extends CommandRunner {
    constructor(private readonly seeder: ContentVersionSeeder) {
        super();
    }

    async run(): Promise<void> {
        try {
            await this.seeder.seed();
        } catch (error) {
            console.error('Error al generar datos de prueba:', error);
            throw error;
        }
    }
} 