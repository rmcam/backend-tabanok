import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { CulturalContent } from '../../features/cultural-content/cultural-content.entity';

export class CulturalContentSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        console.log('Running CulturalContentSeeder...');
        const culturalContentRepository = this.dataSource.getRepository(CulturalContent);

        const culturalContentData: Partial<CulturalContent>[] = [];

        // Crear registros de contenido cultural solo en entornos que no sean producción
        if (process.env.NODE_ENV !== 'production') {
            const culturalContentsToSeed = [
                {
                    title: `Mito de la Creación Kamëntsá`,
                    description: `Exploración del mito fundacional del pueblo Kamëntsá y sus implicaciones culturales.`,
                    category: 'Mitos y Leyendas',
                    content: `Según la tradición oral Kamëntsá, el mundo fue creado por...`,
                    mediaUrls: [`http://example.com/mito_creacion.jpg`, `http://example.com/mito_creacion.mp3`],
                },
                {
                    title: `Danza del Bëtsknaté`,
                    description: `Análisis de la danza tradicional Bëtsknaté, su significado y su rol en las festividades.`,
                    category: 'Danza',
                    content: `La danza del Bëtsknaté es una expresión artística y espiritual...`,
                    mediaUrls: [`http://example.com/danza_betsknate.mp4`],
                },
                {
                    title: `Medicina Tradicional Kamëntsá`,
                    description: `Introducción a las prácticas y conocimientos ancestrales de la medicina Kamëntsá.`,
                    category: 'Medicina',
                    content: `Los sabedores Kamëntsá utilizan plantas medicinales y rituales para...`,
                    mediaUrls: [`http://example.com/medicina_tradicional.jpg`],
                },
                {
                    title: `Artesanía del Valle de Sibundoy`,
                    description: `Un vistazo a las técnicas y simbolismos de la artesanía Kamëntsá, especialmente los chaquiras.`,
                    category: 'Artesanía',
                    content: `La elaboración de chaquiras es una práctica ancestral que...`,
                    mediaUrls: [`http://example.com/artesania_chaquiras.jpg`],
                },
                {
                    title: `Rituales de Armonización`,
                    description: `Descripción de los rituales de armonización y su importancia en la cosmovisión Kamëntsá.`,
                    category: 'Rituales',
                    content: `Los rituales de armonización buscan equilibrar las energías...`,
                    mediaUrls: [`http://example.com/rituales_armonizacion.mp4`],
                },
            ];

            for (const culturalContent of culturalContentsToSeed) {
                const existingCulturalContent = await culturalContentRepository.findOne({
                    where: { title: culturalContent.title }
                });

                if (!existingCulturalContent) {
                    culturalContentData.push(culturalContent);
                } else {
                    console.log(`CulturalContent "${culturalContent.title}" already exists. Skipping.`);
                }
            }

            await culturalContentRepository.save(culturalContentData);
            console.log(`Seeded ${culturalContentData.length} cultural content records (development environment).`);
        } else {
            console.log('Skipping CulturalContentSeeder in production environment.');
        }
    }
}
