'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating AI-composed, real-time order status updates for Telegram.
 *
 * - aiTelegramOrderStatusNotification - A function that generates an order status notification.
 * - AiTelegramOrderStatusNotificationInput - The input type for the notification generation.
 * - AiTelegramOrderStatusNotificationOutput - The return type for the notification generation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTelegramOrderStatusNotificationInputSchema = z.object({
  customerName: z.string().describe("The name of the customer."),
  orderId: z.string().describe("The unique identifier for the order."),
  currentStatus: z.enum(['New', 'Confirmed', 'Shipped', 'Delivered']).describe("The current status of the order (e.g., 'New', 'Confirmed', 'Shipped', 'Delivered')."),
  productName: z.string().describe("The name of the product(s) in the order."),
  estimatedDeliveryDate: z.string().nullable().optional().describe("The estimated delivery date, if available. Format as a readable date string."),
  language: z.enum(['uz', 'ru', 'en']).describe("The desired language for the notification ('uz' for Uzbek, 'ru' for Russian, 'en' for English)."),
});
export type AiTelegramOrderStatusNotificationInput = z.infer<typeof AiTelegramOrderStatusNotificationInputSchema>;

const AiTelegramOrderStatusNotificationOutputSchema = z.object({
  message: z.string().describe("The AI-composed, localized order status notification message."),
});
export type AiTelegramOrderStatusNotificationOutput = z.infer<typeof AiTelegramOrderStatusNotificationOutputSchema>;

export async function aiTelegramOrderStatusNotification(input: AiTelegramOrderStatusNotificationInput): Promise<AiTelegramOrderStatusNotificationOutput> {
  return aiTelegramOrderStatusNotificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'telegramOrderStatusPrompt',
  input: {schema: AiTelegramOrderStatusNotificationInputSchema},
  output: {schema: AiTelegramOrderStatusNotificationOutputSchema},
  prompt: `You are a helpful and polite e-commerce assistant from "Auralook.uz". Your task is to compose a concise and informative real-time order status update for a customer.

Generate the message in the specified language.

Here is the order information:
- Customer Name: {{{customerName}}}
- Order ID: {{{orderId}}}
- Current Status: {{{currentStatus}}}
- Product(s): {{{productName}}}
- Estimated Delivery Date: {{{estimatedDeliveryDate}}} (if available, otherwise ignore this field)
- Language: {{{language}}}

Compose a message that reflects the current status and includes the customer's name, order ID, and product name. If the status is 'Shipped', include the estimated delivery date.

Examples (for 'en' language):
- If currentStatus is 'New': "Hello {{customerName}}, thank you for your order ({{orderId}}) of {{productName}}! We've received it and are processing it now. You will receive another update soon."
- If currentStatus is 'Confirmed': "Great news, {{customerName}}! Your order ({{orderId}}) for {{productName}} has been confirmed and is being prepared for shipment. We'll let you know once it's on its way!"
- If currentStatus is 'Shipped': "Exciting update, {{customerName}}! Your order ({{orderId}}) of {{productName}} has been shipped! It's estimated to arrive by {{estimatedDeliveryDate}}. Get ready for your delivery!"
- If currentStatus is 'Delivered': "Your order ({{orderId}}) of {{productName}} has been delivered, {{customerName}}! We hope you love your purchase. Thank you for choosing Auralook.uz!"

Now, compose the message for the provided order details in the requested language.`,
});

const aiTelegramOrderStatusNotificationFlow = ai.defineFlow(
  {
    name: 'aiTelegramOrderStatusNotificationFlow',
    inputSchema: AiTelegramOrderStatusNotificationInputSchema,
    outputSchema: AiTelegramOrderStatusNotificationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
