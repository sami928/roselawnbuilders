import type { ComponentType } from 'react';
import { site } from '@/site';
import { services } from '@/content/services';
import { faqs } from '@/content/funnel';
import { HomePage } from '@/pages/HomePage';
import { ServicesPage } from '@/pages/ServicesPage';
import { ServicePage } from '@/pages/ServicePage';
import { AboutPage } from '@/pages/AboutPage';
import { PortfolioPage } from '@/pages/PortfolioPage';
import { ThankYouPage } from '@/pages/ThankYouPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export type Crumb = { name: string; path: string };

export type PageRoute = {
  path: string;
  /** Full <title>. Aim for ~60 characters with the main keyword first. */
  title: string;
  /** Meta description. Aim for ~150 characters. */
  description: string;
  Component: ComponentType;
  /** Keep thank-you and utility pages out of search results and the sitemap. */
  noindex?: boolean;
  priority?: number;
  changefreq?: 'weekly' | 'monthly' | 'yearly';
  breadcrumbs?: Crumb[];
  /** Extra JSON-LD objects for this page (the LocalBusiness block is added everywhere). */
  schema?: (siteUrl: string) => object[];
  ogImage?: string;
};

const areaList = site.areas.join(', ');

/**
 * Every public page lives here. To add a page: create a component in src/pages,
 * then add an entry below. It is prerendered to static HTML, gets its own title,
 * description, canonical URL and Open Graph tags, and is added to sitemap.xml.
 */
export const routes: PageRoute[] = [
  {
    path: '/',
    title: `Portland Remodeling & Home Restoration Contractor | ${site.name}`,
    description: `Kitchen and bath remodels, siding, restoration and carpentry across the Portland metro. Licensed ${site.license}. Get your free, no-pressure estimate.`,
    Component: HomePage,
    priority: 1,
    changefreq: 'weekly',
    schema: () => [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
      },
    ],
  },
  {
    path: '/services',
    title: `Remodeling & Construction Services in Portland, OR | ${site.name}`,
    description: `Home restoration, siding, kitchen and bathroom remodels, carpentry, drywall, doors and fences for ${areaList}.`,
    Component: ServicesPage,
    priority: 0.9,
    changefreq: 'monthly',
    breadcrumbs: [{ name: 'Services', path: '/services' }],
  },
  ...services.map<PageRoute>((service) => ({
    path: `/services/${service.slug}`,
    title: `${service.seoTitle} | ${site.name}`,
    description: `${service.description} Serving ${areaList}. Request a free estimate from ${site.name}.`,
    Component: () => <ServicePage service={service} />,
    priority: 0.8,
    changefreq: 'monthly',
    breadcrumbs: [
      { name: 'Services', path: '/services' },
      { name: service.title, path: `/services/${service.slug}` },
    ],
    schema: (siteUrl) => [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.title,
        serviceType: service.title,
        description: service.intro,
        provider: { '@id': `${siteUrl}/#business` },
        areaServed: site.areas.map((name) => ({ '@type': 'City', name })),
        url: `${siteUrl}/services/${service.slug}`,
      },
    ],
  })),
  {
    path: '/portfolio',
    title: `Our Work: Past Projects in the Portland Area | ${site.name}`,
    description: `Photos and video of past ${site.name} projects, from demolition and excavation to drainage and concrete repair, organized stage by stage.`,
    Component: PortfolioPage,
    priority: 0.8,
    changefreq: 'monthly',
    breadcrumbs: [{ name: 'Our work', path: '/portfolio' }],
  },
  {
    path: '/about',
    title: `About ${site.name} | Portland, Oregon Contractor`,
    description: `${site.name} is a licensed Portland-area contractor (${site.licenseShort}) focused on thoughtful remodeling, restoration, and honest communication.`,
    Component: AboutPage,
    priority: 0.7,
    changefreq: 'yearly',
    breadcrumbs: [{ name: 'About', path: '/about' }],
  },
  {
    path: '/thank-you',
    title: `Thanks — we got your project details | ${site.name}`,
    description: 'Your request was received. We will be in touch soon.',
    Component: ThankYouPage,
    noindex: true,
  },
];

export const notFoundRoute: PageRoute = {
  path: '/404',
  title: `Page not found | ${site.name}`,
  description: 'The page you were looking for could not be found.',
  Component: NotFoundPage,
  noindex: true,
};

export const findRoute = (path: string) => routes.find((route) => route.path === path) ?? notFoundRoute;
