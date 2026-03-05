/* eslint-disable @typescript-eslint/require-await */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

type OrderConfirmationJob = {
  email: string;
  orderId: number;
};

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  async process(job: Job<OrderConfirmationJob>): Promise<void> {
    if (job.name === 'order-confirmation') {
      const { email, orderId } = job.data;

      console.log('Sending confirmation email...');
      console.log('Email:', email);
      console.log('Order ID:', orderId);
    }
  }
}
