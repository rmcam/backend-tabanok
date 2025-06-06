import { DataSource } from "typeorm";
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
    const usersToCreate: User[] = [];

    // Crear un usuario profesor adicional con el correo electrónico "teacher@example.com"
    const teacherUser = new User();
    const teacherPlainPassword = "Admin123%#*";
    const teacherHashedPassword = await argon2.hash(teacherPlainPassword);
    teacherUser.email = "teacher@example.com";
    teacherUser.password = teacherHashedPassword;
    teacherUser.firstName = "Teacher";
    teacherUser.lastName = "User";
    teacherUser.username = `teacher_${Math.random().toString(36).substring(7)}`; // Generar un string aleatorio para el username
    teacherUser.roles = [UserRole.TEACHER];
    teacherUser.languages = [];
    teacherUser.preferences = { notifications: true, language: "", theme: "" };
    usersToCreate.push(teacherUser);

    // Crear un usuario administrador adicional con el correo electrónico "admin@example.com"
    const adminUser = new User();
    const adminPlainPassword = "Admin123%#*";
    const adminHashedPassword = await argon2.hash(adminPlainPassword);
    adminUser.email = "admin@admin.com";
    adminUser.password = adminHashedPassword;
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
      // Permitir la creación de usuarios de prueba solo si no es producción
      if (user.email.startsWith('testuser') && process.env.NODE_ENV === 'production') {
          return false;
      }
      return true;
    });

    await userRepository.save(finalUsersToCreate);
    console.log(`Created ${finalUsersToCreate.length} new users.`);
  }
}
