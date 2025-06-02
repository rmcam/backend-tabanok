import { DataSource } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { User } from "../../auth/entities/user.entity";
import { UserRole } from "../../auth/enums/auth.enum"; // Importar UserRole
import { DataSourceAwareSeed } from "./data-source-aware-seed"; // Importar DataSourceAwareSeed


import * as argon2 from "argon2"; // Importar argon2
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

      const plainPassword = "password123"; // Contraseña en texto plano
      const hashedPassword = await argon2.hash(plainPassword); // Hashear la contraseña
      user.email = `testuser${i}_${uuidv4()}@example.com`;
      user.password = hashedPassword; // Asignar la contraseña hasheada
      user.firstName = `Test`;
      user.lastName = `User ${i}`;
      user.username = `testuser${i}_${uuidv4()}`; // Asignar un nombre de usuario único
      user.roles = [i === 0 ? UserRole.ADMIN : UserRole.USER]; // Usar el valor del enum
      user.languages = []; // Inicializar languages como un array vacío
      user.preferences = { notifications: true, language: "", theme: "" }; // Inicializar preferences con las propiedades requeridas
      usersToCreate.push(user);
    }

    // Crear un usuario profesor adicional con el correo electrónico "teacher@example.com"

    const teacherUser = new User();
    const teacherPlainPassword = "Admin123%#*"; // Contraseña en texto plano
    const teacherHashedPassword = await argon2.hash(teacherPlainPassword); // Hashear la contraseña
    // teacherUser.id = uuidv4(); // Permitir que TypeORM genere el ID
    teacherUser.email = "teacher@example.com";
    teacherUser.password = teacherHashedPassword; // Asignar la contraseña hasheada
    teacherUser.firstName = "Teacher";
    teacherUser.lastName = "User";
    teacherUser.username = `teacher_${uuidv4()}`;
    teacherUser.roles = [UserRole.TEACHER];
    teacherUser.languages = [];
    teacherUser.preferences = { notifications: true, language: "", theme: "" };
    usersToCreate.push(teacherUser);

    // Crear un usuario administrador adicional con el correo electrónico "admin@example.com"

    const adminUser = new User();
    const adminPlainPassword = "Admin123%#*"; // Contraseña en texto plano
    const adminHashedPassword = await argon2.hash(adminPlainPassword); // Hashear la contraseña
    // adminUser.id = uuidv4(); // Permitir que TypeORM genere el ID
    adminUser.email = "admin@admin.com";
    adminUser.password = adminHashedPassword; // Asignar la contraseña hasheada
    adminUser.firstName = "Admin";
    adminUser.lastName = "User";
    adminUser.username = `admin`;
    adminUser.roles = [UserRole.ADMIN];
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
