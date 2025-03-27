import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

// Validador para verificar si el texto contiene caracteres especiales de la lengua Kamëntsá
export function IsKamentsaText(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isKamentsaText',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') return false;

                    // Caracteres especiales usados en Kamëntsá
                    const kamentsaChars = ['ë', 'š', 'ž', 'č', 'ñ', 'Ë', 'Š', 'Ž', 'Č', 'Ñ'];

                    // Verificar si el texto contiene al menos un carácter especial Kamëntsá
                    return kamentsaChars.some(char => value.includes(char));
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} debe contener caracteres propios de la lengua Kamëntsá (ë, š, ž, č, ñ)`;
                },
            },
        });
    };
}

// Validador para verificar palabras comunes en Kamëntsá
export function ContainsKamentsaWords(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'containsKamentsaWords',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') return false;

                    // Palabras comunes en Kamëntsá
                    const kamentsaWords = [
                        'bëngbe',
                        'tabanok',
                        'taitá',
                        'batá',
                        'bëtsá',
                        'bëtsëtsang',
                        'kamëntsá',
                        'biyá',
                        'wamán',
                        'yebnok',
                        'tsabe',
                        'jajañ'
                    ];

                    const lowerValue = value.toLowerCase();
                    return kamentsaWords.some(word => lowerValue.includes(word.toLowerCase()));
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} debe contener al menos una palabra en Kamëntsá`;
                },
            },
        });
    };
}

// Validador para verificar la estructura gramatical básica
export function HasKamentsaStructure(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'hasKamentsaStructure',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    if (typeof value !== 'string') return false;

                    // Sufijos comunes en Kamëntsá
                    const commonSuffixes = ['eng', 'ëng', 'ak', 'ok', 'be'];

                    return commonSuffixes.some(suffix =>
                        value.toLowerCase().split(' ').some(word => word.endsWith(suffix))
                    );
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} debe contener estructuras gramaticales propias del Kamëntsá`;
                },
            },
        });
    };
}

// Validador para verificar categorías culturales válidas
export function IsValidKamentsaCategory(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isValidKamentsaCategory',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const validCategories = [
                        'jajañ', // territorio
                        'bëtsknaté', // festividades
                        'oboyejuayán', // medicina tradicional
                        'juabn', // pensamiento
                        'oyebuambnayán', // educación
                        'jenoyeunayán', // artesanías
                        'anteo tempsc', // historia
                        'bëngbe uáman', // sagrado
                    ];

                    return validCategories.includes(value.toLowerCase());
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} debe ser una categoría válida en Kamëntsá`;
                },
            },
        });
    };
} 