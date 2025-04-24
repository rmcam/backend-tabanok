import { Unity } from '../../features/unity/entities/unity.entity';
import { DataSource } from 'typeorm';

export const UnitySeeder = {
  async seed(dataSource: DataSource): Promise<void> {
    const unityRepository = dataSource.getRepository(Unity);

    // Check if unities already exist
    const existingUnities = await unityRepository.count();
    if (existingUnities > 0) {
      console.log('Unities already exist, skipping seeding...');
      return;
    }

    const unities = [
      { name: 'Unidad 1', description: 'Descripción de la unidad 1', userId: '1' },
      { name: 'Unidad 2', description: 'Descripción de la unidad 2', userId: '1' },
      { name: 'Unidad 3', description: 'Descripción de la unidad 3', userId: '1' },
    ];

    await unityRepository.insert(unities);
    console.log('Unities seeded successfully!');
  },
};
