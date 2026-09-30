import productsJson from '../../data/products_db.json';
import heroBannerImg from '../assets/images/hero_zarri_banner_1790507325438.jpg';
import { BannerConfig, Product } from '../types';

export const INITIAL_BANNER_CONFIG: BannerConfig = {
  heroTitle: 'Premium Zarri Chappal & Khussa',
  heroSubtitle: 'Premium Quality • Stylish Designs • Delivery Across Pakistan',
  heroImage: heroBannerImg,
  enableRunningBanner: true,
  announcementText: '✨ Special Offer: Get Extra 5% OFF on all Advance Payments via JazzCash, Easypaisa or UBL Bank! Delivery Across Pakistan.',
};

// Genuine handcrafted products preserved from data/products_db.json
export const INITIAL_PRODUCTS: Product[] = productsJson as Product[];

export const INITIAL_CATEGORIES = [
  "All Products",
  "Men's Chappal",
  "Men's Khussa",
  "Women's Chappal",
  "Women's Khussa",
  "New Arrivals",
  "Featured Products"
];
