import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isPasswordStrong', async: false })
export class IsPasswordStrong implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    // Verificar si la contraseña es una cadena válida antes de validar la fortaleza
    if (typeof password !== 'string' || password.length === 0) {
      // Si no se proporciona contraseña, otros validadores como @IsNotEmpty se encargarán.
      // Devolvemos true aquí para no duplicar errores, o false si queremos que este validador falle explícitamente.
      // Optaremos por false para ser explícitos, aunque @IsNotEmpty debería atraparlo primero.
      return false;
    }

    // Lógica existente para validar la fortaleza de la contraseña
    if (password.length < 8) {
      return false;
    }
    if (!/[0-9]/.test(password)) {
      return false;
    }
    if (!/[a-z]/.test(password)) {
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      return false;
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    // Aquí puedes personalizar el mensaje de error
    return 'La contraseña debe tener al menos 8 caracteres, un número, una letra mayúscula, una letra minúscula y un carácter especial.';
  }
}
