import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { AWS_CONFIG } from '../config/aws-config';


export class S3Service {
    private client: S3Client;

    constructor(){
        this.client = new S3Client({
            region: AWS_CONFIG.region
        })
    }

    async uploadFile(bucketName: string, key: string, body: Buffer) : Promise<void> {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key, 
            Body: body,
        })
        try {
            await this.client.send(command);
            console.log(`File uploaded to S3: ${key}`);
        } catch(error){
            console.error('Error uploading file to S3:', error);
            throw new Error('Failed to upload file to S3');
        }
    }

    async getFile(bucketName: string, key: string): Promise<Buffer> {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        try {
            const response = await this.client.send(command);
            const stream = response.Body as any;
            const chunks: Buffer[] = [];

            for await (const chunk of stream) {
                chunks.push(chunk);
            }

            return Buffer.concat(chunks);
        } catch (error) {
            console.error('Error getting file from S3:', error);
            throw new Error('Failed to get file from S3');
        }
    }
}