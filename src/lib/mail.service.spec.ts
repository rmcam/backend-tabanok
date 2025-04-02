import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

    it('should send reset password email', async () => {
        const email = 'test@example.com';
        const token = 'test-token';
        
        await service.sendResetPasswordEmail(email, token);
        
        expect(service.getTransporterForTesting().sendMail).toHaveBeenCalledWith({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Restablecimiento de contraseña',
            text: expect.stringContaining(token),
            html: expect.stringContaining(token)
        });
    });
});
