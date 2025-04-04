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

                    // Alfabeto Kamëntsá (extraído de consolidated_dictionary.json)
                    const kamentsaAlphabet = ['a', 'b', 'c', 'ch', 'd', 'e', 'ë', 'f', 'g', 'i', 'j', 'k', 'l', 'll', 'm', 'n', 'ñ', 'o', 'p', 'q', 'r', 'rr', 's', 's̈', 'sh', 't', 'ts', 'ts̈', 'u', 'v', 'y', 'z', 'A', 'B', 'C', 'Ch', 'D', 'E', 'Ë', 'F', 'G', 'I', 'J', 'K', 'L', 'Ll', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'Rr', 'S', 'S̈', 'Sh', 'T', 'Ts', 'Ts̈', 'U', 'V', 'Y', 'Z'];

                    // Expresión regular para verificar si el texto contiene solo caracteres válidos en Kamëntsá
                    const kamentsaRegex = new RegExp(`^[${kamentsaAlphabet.join('')}\\s.,!?¡¿]+$`);

                    // Verificar si el texto contiene solo caracteres válidos en Kamëntsá
                    return kamentsaRegex.test(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} debe contener solo caracteres válidos en la lengua Kamëntsá`;
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

                    // Palabras comunes en Kamëntsá (extraídas de consolidated_dictionary.json)
                    const kamentsaWords = [
                        "aa", "ababiayá", "ababuanÿeshaná", "abacayá", "abajtoyá", "abaná", "ainán", "bejay", "buiñ", "abatëmbayá", "abayá", "abentsá", "abjatená", "abuatambayá", "achëjuaná", "basetem", "batá", "bebmá", "bëngbe", "bëtsá", "binÿia", "bobonshá", "bochëjuaná", "bonshá", "buyesh", "kamëntsá", "canÿe", "cha", "chat", "chëng", "chembá", "chenÿá", "chëtsá̈", "fsantsá", "fsëntsá̈", "fsn̈ëbé", "ftsenëng", "jabuachán", "jamán", "jatán", "mamá", "mashacbe", "ndayá", "ndoñ", "saná", "taitá", "tsasá", "tsëmbé", "tsëntsá̈", "uabouaná", "uaquiñá", "uatsjendayá", "uta", "unga", "canta", "shachna", "buashënga", "uabuangana", "uafjentsá", "bebmabe uabentsá", "batabe uabentsá", "cucuats̈", "shecuats̈", "jabostán", "jenojuaboyán", "joyebuambayán", "mor", "cabá", "yëfsá", "básoy", "binÿe", "ibeta", "uafjnguëná", "uabuatmá", "uabouantá", "tsëntsa", "tsëquëná", "tsëtsá̈", "tsbanán", "tsbananëjua", "tsbuanasha", "tsjuán", "uabená", "uabouana", "uacheuán", "uajabotá", "uamná", "uantjëshá", "uatëcmá", "uatsëmnayá", "yebná", "yentsá̈", "uashá", "uatsjendayëng", "uayená", "yojuá", "yojuaná", "shembása", "bobontsá", "obená", "tobias̈á", "uabochjuaná", "tsäbá", "ndoñ tsäbá", "botamana", "bëtsá", "base", "chnëngua", "canÿsëfta", "posufta", "unga", "bnëtsana", "nguëmëná", "uabocnana", "fsantsa", "cats̈ata", "uabentsá", "bëtsëtsá̈", "bëtsamamá", "jinÿán", "jouenán", "jtsanán", "jotjajuán", "shachajuá", "betiyé", "shëntsjañ", "tjañ", "shboachan", "mishén", "shlofts̈", "tobias̈", "bëtscnaté", "tabanoy", "tatsëmbuá", "uaishanÿá", "tamnayá", "uastajuayá", "tsombiach", "uashanantsá", "aíñe", "tsä botamana binÿe", "tsä botamana ibeta", "chë tempo", "yëfsá bochjinÿena", "tsä jtsebos", "diosmanda", "nÿe chca"
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

                    // Patrones gramaticales comunes en Kamëntsá (extraídos de consolidated_dictionary.json)
                    const commonPatterns = [
                        "-á", "-at", "-ng", "së", "co", "en", "fsë", "sm̈o", "tmo", "bo", "so", "tbo", "fch", "sm̈och", "mo"
                    ];

                    return commonPatterns.some(pattern =>
                        value.toLowerCase().split(' ').some(word => word.includes(pattern))
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
                        'música',
                        'danza',
                        'comida',
                        'familia',
                        'naturaleza',
                        'animales',
                        'plantas'
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
