import { DataSource } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { User } from "../../auth/entities/user.entity";
import { UserRole } from "../../auth/enums/auth.enum"; // Importar UserRole
import { DataSourceAwareSeed } from "./data-source-aware-seed"; // Importar DataSourceAwareSeed
// import { UserFactory } from '../factories/user.factory'; // Asumiendo que existe un factory para User

export class UserSeeder extends DataSourceAwareSeed {
  // Extender de DataSourceAwareSeed
  constructor(dataSource: DataSource) {
    // Añadir constructor que acepta DataSource
    super(dataSource);
  }

  public async run(): Promise<void> {
    // Modificar run para que no acepte argumentos
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
      // user.id = uuidv4(); // Permitir que TypeORM genere el ID
      user.email = `testuser${i}_${uuidv4()}@example.com`;
      user.password = "password123"; // Considerar hashear la contraseña en un seeder real
      user.firstName = `Test`;
      user.lastName = `User ${i}`;
      user.username = `testuser${i}_${uuidv4()}`; // Asignar un nombre de usuario único
      user.role = i === 0 ? UserRole.ADMIN : UserRole.USER; // Usar el valor del enum
      user.languages = []; // Inicializar languages como un array vacío
      user.preferences = { notifications: true, language: "", theme: "" }; // Inicializar preferences con las propiedades requeridas
      usersToCreate.push(user);
    }

    // Crear un usuario profesor adicional con el correo electrónico "teacher@example.com"
    const teacherUser = new User();
    // teacherUser.id = uuidv4(); // Permitir que TypeORM genere el ID
    teacherUser.email = "teacher@example.com";
    teacherUser.password = "Admin123%#*";
    teacherUser.firstName = "Teacher";
    teacherUser.lastName = "User";
    teacherUser.username = `teacher_${uuidv4()}`;
    teacherUser.role = UserRole.TEACHER;
    teacherUser.languages = [];
    teacherUser.preferences = { notifications: true, language: "", theme: "" };
    usersToCreate.push(teacherUser);

    // Crear un usuario administrador adicional con el correo electrónico "admin@example.com"
    const adminUser = new User();
    // adminUser.id = uuidv4(); // Permitir que TypeORM genere el ID
    adminUser.email = "admin@example.com";
    adminUser.password = "Admin123%#*";
    adminUser.firstName = "Admin";
    adminUser.lastName = "User";
    adminUser.username = `admin_${uuidv4()}`;
    adminUser.role = UserRole.ADMIN;
    adminUser.languages = [];
    adminUser.preferences = { notifications: true, language: "", theme: "" };
    usersToCreate.push(adminUser);

    // Verificar si los usuarios teacher y admin ya existen antes de intentar guardarlos
    const existingTeacher = await userRepository.findOne({ where: { email: teacherUser.email } });
    const existingAdmin = await userRepository.findOne({ where: { email: adminUser.email } });

    const finalUsersToCreate = usersToCreate.filter(user => {
      if (user.email === teacherUser.email && existingTeacher) {
        console.log(`User with email ${teacherUser.email} already exists. Skipping creation.`);
        return false;
      }
      if (user.email === adminUser.email && existingAdmin) {
        console.log(`User with email ${adminUser.email} already exists. Skipping creation.`);
        return false;
      }
      return true;
    });


    await userRepository.save(finalUsersToCreate);

    console.log(`Created ${finalUsersToCreate.length} new users.`);
  }
}
