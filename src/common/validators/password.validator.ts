import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isPasswordStrong', async: false })
export class IsPasswordStrong implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    // Aquí puedes agregar tu lógica para validar la fortaleza de la contraseña
    // Por ejemplo, puedes verificar la longitud, la presencia de caracteres especiales, etc.
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
