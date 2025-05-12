import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed'; // Importar DataSourceAwareSeed
import { User } from '../../auth/entities/user.entity';
import { UserRole } from '../../auth/enums/auth.enum'; // Importar UserRole
// import { UserFactory } from '../factories/user.factory'; // Asumiendo que existe un factory para User

export class UserSeeder extends DataSourceAwareSeed { // Extender de DataSourceAwareSeed
  constructor(dataSource: DataSource) { // Añadir constructor que acepta DataSource
    super(dataSource);
  }

  public async run(): Promise<void> { // Modificar run para que no acepte argumentos
    // Utilizar this.dataSource para obtener el repositorio o query runner
    const userRepository = this.dataSource.getRepository(User);

    // Crear usuarios utilizando el repositorio o un factory si existe
    // Ejemplo usando un factory (si existe y está configurado)
    // const userFactory = new UserFactory(this.dataSource); // Asumiendo que el factory necesita dataSource
    // await userFactory.createMany(5);

    // Ejemplo creando usuarios directamente
    const usersToCreate = [];
    for (let i = 0; i < 5; i++) {
      const user = new User();
      user.email = `testuser${i}@example.com`;
      user.password = 'password123'; // Considerar hashear la contraseña en un seeder real
      user.firstName = `Test`;
      user.lastName = `User ${i}`;
      user.username = `testuser${i}`; // Asignar un nombre de usuario único
      user.role = UserRole.USER; // Usar el valor del enum
      user.languages = []; // Inicializar languages como un array vacío
      user.preferences = { notifications: true, language: '', theme: '' }; // Inicializar preferences con las propiedades requeridas
      usersToCreate.push(user);
    }
    await userRepository.save(usersToCreate);

    console.log('Created 5 test users.');
  }
}
