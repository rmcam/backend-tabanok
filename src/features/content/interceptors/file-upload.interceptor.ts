import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ContentType } from '../enums/content-type.enum';

export function FileUploadInterceptor(fieldName: string, type: ContentType): Type<NestInterceptor> {
    @Injectable()
    class MixinInterceptor implements NestInterceptor {
        private fileFilter(
            _req: any,
            file: Express.Multer.File,
            callback: (error: Error | null, acceptFile: boolean) => void,
        ) {
            const allowedMimeTypes = {
                [ContentType.VIDEO]: ['video/mp4', 'video/webm', 'video/quicktime'],
                [ContentType.AUDIO]: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
                [ContentType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif'],
                [ContentType.DOCUMENT]: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            };

            if (allowedMimeTypes[type]?.includes(file.mimetype)) {
                callback(null, true);
            } else {
                callback(new Error('Tipo de archivo no permitido'), false);
            }
        }

        private multerOptions(): MulterOptions {
            return {
                fileFilter: this.fileFilter.bind(this),
                limits: {
                    fileSize: 1024 * 1024 * 50, // 50MB máximo
                },
            };
        }

        intercept(...args: any[]) {
            const interceptor = new (FileInterceptor(fieldName, this.multerOptions()))();
            return interceptor.intercept.apply(interceptor, args);
        }
    }

    return mixin(MixinInterceptor);
} 