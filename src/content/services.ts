import { Bath, Home, Layers3, Ruler, Sparkles, Trees, type LucideIcon } from 'lucide-react';

export type Service = {
  slug: string;
  label: string;
  title: string;
  /** Used in the page <title> and H1 — phrase it the way people search. */
  seoTitle: string;
  description: string;
  intro: string;
  highlights: string[];
  icon: LucideIcon;
};

export const services: Service[] = [
  {
    slug: 'home-restoration',
    label: 'Restoration',
    title: 'Home restoration',
    seoTitle: 'Home Restoration in Portland, OR',
    description: 'Thoughtful repairs that bring character, comfort, and value back to your home.',
    intro:
      'Older Portland homes have details worth saving. We repair and restore trim, windows, porches, and interiors with methods that respect the original craftsmanship while making the house work for modern life.',
    highlights: ['Dry rot and water damage repair', 'Porch, trim, and millwork restoration', 'Period-appropriate materials and details', 'Whole-home refresh planning'],
    icon: Home,
  },
  {
    slug: 'siding',
    label: 'Exterior',
    title: 'Siding & exterior',
    seoTitle: 'Siding Installation & Repair in Portland, OR',
    description: 'Durable siding upgrades and weather-ready exterior work built for the Northwest.',
    intro:
      'Northwest rain is hard on a house. We replace and repair siding with careful flashing, weather barriers, and trim work so your exterior looks sharp and keeps water where it belongs — outside.',
    highlights: ['Full siding replacement and spot repair', 'Fiber cement, cedar, and engineered wood', 'Flashing, house wrap, and rot remediation', 'Exterior trim and paint-ready finishes'],
    icon: Layers3,
  },
  {
    slug: 'bathroom-remodels',
    label: 'Remodeling',
    title: 'Bathroom remodels',
    seoTitle: 'Bathroom Remodeling in Portland, OR',
    description: 'Calm, functional bathrooms with clean details and a finish that lasts.',
    intro:
      'From a hall-bath refresh to a full primary suite, we plan the layout, waterproofing, tile, and fixtures together with you so the finished room is easy to clean, comfortable to use, and built to last.',
    highlights: ['Walk-in showers and tub-to-shower conversions', 'Tile, waterproofing, and ventilation', 'Vanities, storage, and lighting', 'Accessibility and aging-in-place upgrades'],
    icon: Bath,
  },
  {
    slug: 'kitchen-remodels',
    label: 'Remodeling',
    title: 'Kitchen remodels',
    seoTitle: 'Kitchen Remodeling in Portland, OR',
    description: 'Better layouts, better storage, and a kitchen made for the way you live.',
    intro:
      'A great kitchen starts with the way you cook and gather. We rework layouts, cabinetry, counters, and lighting, and coordinate the trades so your project moves in a clear, predictable sequence.',
    highlights: ['Layout redesign and wall removal', 'Cabinet, countertop, and backsplash installation', 'Lighting and electrical coordination', 'Pantry and storage solutions'],
    icon: Sparkles,
  },
  {
    slug: 'carpentry-framing-drywall',
    label: 'Craftsmanship',
    title: 'Carpentry, framing & drywall',
    seoTitle: 'Carpentry, Framing & Drywall in Portland, OR',
    description: 'The essential work behind beautiful rooms, handled with precision from the start.',
    intro:
      'Straight walls, square openings, and smooth finishes are what make every other trade look good. We handle framing changes, drywall, and finish carpentry with the precision the rest of your project depends on.',
    highlights: ['Wall framing, openings, and structural changes', 'Drywall hanging, finishing, and repair', 'Trim, casing, and built-ins', 'Basement and attic finishing'],
    icon: Ruler,
  },
  {
    slug: 'doors-fences',
    label: 'Finishing work',
    title: 'Doors & fences',
    seoTitle: 'Door Installation & Fence Building in Portland, OR',
    description: 'Practical, polished finishing work that makes your home feel complete.',
    intro:
      'Doors that close cleanly and fences that stay straight are small things you notice every day. We install interior and exterior doors and build fences and gates sized to your property and your neighbors.',
    highlights: ['Interior and exterior door installation', 'Cedar fences and custom gates', 'Hardware, weatherstripping, and adjustments', 'Repair of sagging gates and posts'],
    icon: Trees,
  },
];

export const serviceTitles = services.map((service) => service.title);
