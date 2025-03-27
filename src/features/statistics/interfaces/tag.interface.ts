export enum TagType {
    DIFFICULTY = 'difficulty',
    TOPIC = 'topic',
    SKILL = 'skill',
    CULTURAL = 'cultural',
    CUSTOM = 'custom'
}

export enum TagColor {
    RED = 'red',
    BLUE = 'blue',
    GREEN = 'green',
    YELLOW = 'yellow',
    PURPLE = 'purple',
    ORANGE = 'orange',
    PINK = 'pink',
    GRAY = 'gray'
}

export interface Tag {
    id: string;
    name: string;
    type: TagType;
    color: TagColor;
    description?: string;
    parentId?: string; // Para etiquetas jerárquicas
    metadata?: Record<string, any>;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
} 