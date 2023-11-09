import { Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    transporter: Transporter;
    constructor(configService: ConfigService);
    sendMail({ to, subject, html }: {
        to: any;
        subject: any;
        html: any;
    }): Promise<void>;
}
