import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform, ValidationPipe } from '@nestjs/common';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    try {
      return await super.transform(value, metadata);
    } catch (e) {
      if (e instanceof BadRequestException) {
        const errors = e.message;
        throw new BadRequestException({
          message: errors,
        });
      }
      throw e;
    }
  }
}
