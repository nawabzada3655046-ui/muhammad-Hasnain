import { CartItem, Order, Product } from '../types';

export const STORE_WHATSAPP_NUMBER = '03432782295';
export const STORE_WHATSAPP_INT = '923432782295';
export const STORE_ADDRESS = 'Shop 1/2/3, KPK Hazara, TT Hotel, Chani Goth, Liaqatpur';

export function getGeneralWhatsAppUrl(message?: string): string {
  const text = message || 'Assalam-o-Alaikum Hasnain Zarri Chappal Store! I would like to know more about your traditional handcrafted Zarri Chappals and Khussas.';
  return `https://wa.me/${STORE_WHATSAPP_INT}?text=${encodeURIComponent(text)}`;
}

export function getProductWhatsAppUrl(
  product: Product,
  selectedSize?: string | number,
  quantity: number = 1,
  customerName?: string
): string {
  const currentOrigin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
  const productLink = currentOrigin ? `${currentOrigin}/#product-${product.id}` : '';
  const sizeText = selectedSize ? `\n👟 *Selected Size:* ${selectedSize}` : '';
  const nameText = customerName ? `\n👤 *Customer Name:* ${customerName}` : '';
  const linkText = productLink ? `\n🔗 *Product Link:* ${productLink}` : '';
  
  const text = `Assalam-o-Alaikum Hasnain Zarri Chappal Store! 🌟
I want to order this product:

👞 *Product Name:* ${product.title}
💰 *Price:* Rs. ${product.price.toLocaleString()}${sizeText}
🔢 *Quantity:* ${quantity}${nameText}${linkText}

Please confirm my order booking and delivery details. Delivery Across Pakistan.`;

  return `https://wa.me/${STORE_WHATSAPP_INT}?text=${encodeURIComponent(text)}`;
}

export function getOrderWhatsAppUrl(order: Order): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.product.title}* (Size: ${item.selectedSize}) x${item.quantity} = Rs. ${(item.product.price * item.quantity).toLocaleString()}`
    )
    .join('\n');

  const discountText =
    order.discount > 0 ? `\n🎁 *5% Advance Discount:* -Rs. ${order.discount.toLocaleString()}` : '';

  const text = `Assalam-o-Alaikum Hasnain Zarri Chappal Store! 🌟
I have placed an order on your website:

📋 *Order ID:* #${order.id}
👤 *Customer Name:* ${order.customerName}
📞 *Contact / WhatsApp:* ${order.whatsappNumber}
📍 *Delivery Address:* ${order.address}, ${order.city}${order.postalCode ? ` (${order.postalCode})` : ''}

🛒 *Items Ordered:*
${itemsText}

💵 *Subtotal:* Rs. ${order.subtotal.toLocaleString()}${discountText}
🚚 *Delivery:* FREE Across Pakistan
⭐ *Final Total:* Rs. ${order.finalAmount.toLocaleString()}
💳 *Payment Method:* ${order.paymentMethod === 'advance' ? 'Advance Payment (JazzCash/Easypaisa/UBL - Screenshot Uploaded)' : 'Cash on Delivery (COD)'}
${order.specialInstructions ? `\n📝 *Notes:* ${order.specialInstructions}` : ''}

Please confirm my order and share tracking details. Thank you!`;

  return `https://wa.me/${STORE_WHATSAPP_INT}?text=${encodeURIComponent(text)}`;
}

export function getCustomerStatusWhatsAppUrl(order: Order, statusMessage: string): string {
  // Cleans customer number for international WhatsApp link
  let cleanNumber = order.whatsappNumber.replace(/[^0-9]/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '92' + cleanNumber.substring(1);
  }
  const text = `Assalam-o-Alaikum ${order.customerName}! 
Regarding your Order #${order.id} at *Hasnain Zarri Chappal Store*:
${statusMessage}

Thank you for choosing Hasnain Zarri Chappal Store.`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}
