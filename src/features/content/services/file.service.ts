import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ContentType } from '../enums/content-type.enum';

@Injectable()
export class FileService {
    private readonly logger = new Logger(FileService.name);
    private readonly uploadDir: string;

    constructor(private configService: ConfigService) {
        this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || 'uploads';
        this.ensureUploadDirectory();
    }

    private ensureUploadDirectory() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    private getFileExtension(file: Express.Multer.File): string {
        return path.extname(file.originalname).toLowerCase();
    }

    private validateFileType(file: Express.Multer.File, type: ContentType): boolean {
        const extension = this.getFileExtension(file);
        const allowedExtensions = {
            [ContentType.VIDEO]: ['.mp4', '.webm', '.mov'],
            [ContentType.AUDIO]: ['.mp3', '.wav', '.ogg'],
            [ContentType.IMAGE]: ['.jpg', '.jpeg', '.png', '.gif'],
            [ContentType.DOCUMENT]: ['.pdf', '.doc', '.docx'],
        };

        return allowedExtensions[type]?.includes(extension) || false;
    }

    async saveFile(file: Express.Multer.File, type: ContentType): Promise<string> {
        if (!this.validateFileType(file, type)) {
            throw new Error('Tipo de archivo no válido');
        }

        const fileName = `${uuidv4()}${this.getFileExtension(file)}`;
        const filePath = path.join(this.uploadDir, fileName);

        try {
            await fs.promises.writeFile(filePath, file.buffer);
            return fileName;
        } catch (error) {
            this.logger.error(`Error al guardar archivo: ${error.message}`);
            throw new Error('Error al guardar el archivo');
        }
    }

    async deleteFile(fileName: string): Promise<void> {
        const filePath = path.join(this.uploadDir, fileName);
        try {
            await fs.promises.unlink(filePath);
        } catch (error) {
            this.logger.error(`Error al eliminar archivo: ${error.message}`);
            throw new Error('Error al eliminar el archivo');
        }
    }

    getFilePath(fileName: string): string {
        return path.join(this.uploadDir, fileName);
    }
} 