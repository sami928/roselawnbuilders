/**
 * Business details used across every page, the structured data, and the sitemap.
 * Edit here — nothing else hard-codes the phone number, license, or service area.
 */
export const site = {
  name: 'Roselawn Builders',
  tagline: 'Building better spaces for the people who live in them.',
  phone: '865-216-3989',
  phoneHref: 'tel:+18652163989',
  email: 'nice@roselawnbuilders.com',
  license: 'Oregon CCB #229718',
  licenseShort: 'CCB #229718',
  region: 'Portland Metro, Oregon',
  city: 'Portland',
  state: 'OR',
  areas: ['Portland', 'Beaverton', 'Hillsboro', 'Lake Oswego', 'Milwaukie', 'Gresham'],
  logo: '/images/signal-2026-09-22-19-30-18-933-1.jpg',
  ogImage: '/images/signal-2026-09-22-19-30-18-933-1.jpg',
  googleBusinessUrl: 'https://www.google.com/maps/search/?api=1&query=Roselawn+Builders+Portland+Oregon',
  /**
   * Add real customer reviews here (quote, name, neighborhood, project) and the
   * testimonials section appears on the funnel automatically. Only publish reviews
   * from actual clients who gave permission.
   */
  testimonials: [] as { quote: string; name: string; location: string; project: string }[],
};
