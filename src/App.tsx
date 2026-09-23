import { FormEvent, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  ArrowRight,
  BadgeCheck,
  Bath,
  Check,
  ChevronDown,
  Hammer,
  Home,
  Instagram,
  Layers3,
  Mail,
  MapPin,
  Menu,
  Phone,
  Ruler,
  ShieldCheck,
  Sparkles,
  Trees,
  X,
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Service = {
  slug: string;
  label: string;
  title: string;
  description: string;
  icon: typeof Home;
};

const services: Service[] = [
  {
    slug: 'home-restoration',
    label: 'Restoration',
    title: 'Home restoration',
    description: 'Thoughtful repairs that bring character, comfort, and value back to your home.',
    icon: Home,
  },
  {
    slug: 'siding',
    label: 'Exterior',
    title: 'Siding & exterior',
    description: 'Durable siding upgrades and weather-ready exterior work built for the Northwest.',
    icon: Layers3,
  },
  {
    slug: 'bathroom-remodels',
    label: 'Remodeling',
    title: 'Bathroom remodels',
    description: 'Calm, functional bathrooms with clean details and a finish that lasts.',
    icon: Bath,
  },
  {
    slug: 'kitchen-remodels',
    label: 'Remodeling',
    title: 'Kitchen remodels',
    description: 'Better layouts, better storage, and a kitchen made for the way you live.',
    icon: Sparkles,
  },
  {
    slug: 'carpentry-framing-drywall',
    label: 'Craftsmanship',
    title: 'Carpentry, framing & drywall',
    description: 'The essential work behind beautiful rooms, handled with precision from the start.',
    icon: Ruler,
  },
  {
    slug: 'doors-fences',
    label: 'Finishing work',
    title: 'Doors & fences',
    description: 'Practical, polished finishing work that makes your home feel complete.',
    icon: Trees,
  },
];

const locations = ['Portland', 'Beaverton', 'Hillsboro', 'Lake Oswego', 'Milwaukie', 'Gresham'];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const service = services.find((item) => path.includes(item.slug));
    const title = service
      ? `${service.title} Portland OR | Roselawn Builders`
      : path.includes('about')
        ? 'About Roselawn Builders | Portland Oregon Contractor'
        : 'Roselawn Builders | Portland Oregon Home Restoration & Remodeling';
    const description = service
      ? `${service.title} for Portland, Beaverton, Hillsboro, Lake Oswego, Milwaukie, and Gresham. Request a thoughtful, local estimate from Roselawn Builders.`
      : 'Roselawn Builders is a Portland-area contractor for home restoration, siding, kitchens, bathrooms, carpentry, drywall, doors, and fences.';
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [path]);

  const navigate = (href: string) => {
    window.history.pushState({}, '', href);
    setPath(href);
    setMenuOpen(false);
  };

  const isService = services.some((item) => path.includes(item.slug));
  const currentService = services.find((item) => path.includes(item.slug));

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="announcement"><span className="announcement-dot" /> Serving the greater Portland area · CCB #229718</div>
        <div className="nav-wrap">
          <button className="brand" onClick={() => navigate('/')} aria-label="Roselawn Builders home">
            <img src="/images/signal-2026-09-22-19-30-18-933-1.jpg" alt="Roselawn Builders" />
          </button>
          <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
            <button onClick={() => navigate('/')}>Home</button>
            <div className="nav-dropdown">
              <button onClick={() => navigate('/services')}>Services <ChevronDown size={14} /></button>
              <div className="dropdown-panel">
                {services.map((service) => <button key={service.slug} onClick={() => navigate(`/services/${service.slug}`)}>{service.title}</button>)}
              </div>
            </div>
            <button onClick={() => navigate('/about')}>About</button>
            <a href="https://www.google.com/maps/search/?api=1&query=Roselawn+Builders+Portland+Oregon" target="_blank" rel="noreferrer">Google Business <ArrowRight size={14} /></a>
            <a className="nav-mobile-cta" href="tel:8652163989">Call 865-216-3989</a>
          </nav>
          <a className="header-cta" href="#estimate">Start a project <ArrowRight size={16} /></a>
          <button className="menu-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      {isService && currentService ? <ServicePage service={currentService} onNavigate={navigate} /> : path.includes('about') ? <AboutPage onNavigate={navigate} /> : path === '/services' ? <ServicesPage onNavigate={navigate} /> : <HomePage onNavigate={navigate} />}

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand"><img src="/images/signal-2026-09-22-19-30-18-933-1.jpg" alt="Roselawn Builders" /><p>Building better spaces for the people who live in them.</p></div>
          <div><p className="footer-label">Explore</p><button onClick={() => navigate('/services')}>Services</button><button onClick={() => navigate('/about')}>About Roselawn</button><a href="https://www.google.com/maps/search/?api=1&query=Roselawn+Builders+Portland+Oregon" target="_blank" rel="noreferrer">Google Business</a></div>
          <div><p className="footer-label">Get in touch</p><a href="tel:8652163989"><Phone size={15} /> 865-216-3989</a><a href="mailto:nice@roselawnbuilders.com"><Mail size={15} /> nice@roselawnbuilders.com</a><span><MapPin size={15} /> Portland Metro, Oregon</span></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Roselawn Builders</span><span>Oregon CCB #229718</span><span>Serving Portland · Beaverton · Hillsboro · Lake Oswego · Milwaukie · Gresham</span></div>
      </footer>
    </div>
  );
}

function HomePage({ onNavigate }: { onNavigate: (href: string) => void }) {
  return <>
    <section className="hero"><div className="hero-text"><p className="eyebrow"><span className="eyebrow-line" /> Portland-area builders</p><h1>Make room for <em>better living.</em></h1><p className="hero-copy">From careful restoration to full kitchen and bath remodels, Roselawn Builders brings dependable craftsmanship to the homes of the Portland metro area.</p><div className="hero-actions"><a className="button button-primary" href="#estimate">Tell us about your project <ArrowRight size={17} /></a><a className="button button-quiet" href="tel:8652163989"><Phone size={17} /> 865-216-3989</a></div><div className="hero-proof"><div><strong>CCB</strong><span>#229718</span></div><div><strong>6</strong><span>local communities</span></div><div><strong>1</strong><span>trusted builder</span></div></div></div><div className="hero-art"><div className="art-card art-card-main"><div className="art-grid" /><span>Build with intention</span></div><div className="art-card art-card-small"><Hammer size={20} /><span>Made for real life</span></div><div className="hero-stamp"><BadgeCheck size={18} /> Licensed Oregon contractor</div></div></section>
    <section className="intro section"><div className="section-kicker">What we do</div><div className="intro-grid"><h2>Good work starts with <em>a good conversation.</em></h2><div><p>Whether you are restoring a treasured home or finally making the changes you have been imagining, we keep the process clear, collaborative, and grounded in quality.</p><button className="text-link" onClick={() => onNavigate('/about')}>Meet Roselawn Builders <ArrowRight size={16} /></button></div></div></section>
    <section className="services section"><div className="section-heading"><div><div className="section-kicker">Our services</div><h2>Work that makes <em>home feel right.</em></h2></div><button className="text-link" onClick={() => onNavigate('/services')}>View all services <ArrowRight size={16} /></button></div><div className="service-grid">{services.slice(0, 4).map((service, index) => <ServiceCard key={service.slug} service={service} index={index} onNavigate={onNavigate} />)}</div></section>
    <section className="quote-band"><div><p className="eyebrow eyebrow-light"><span className="eyebrow-line" /> The Roselawn standard</p><h2>Built to feel like <em>you.</em></h2></div><p>Every home has its own rhythm. Our job is to listen closely, solve thoughtfully, and leave you with work that feels like it has always belonged there.</p></section>
    <section className="estimate section" id="estimate"><div className="estimate-intro"><div className="section-kicker">Start a conversation</div><h2>Have a project <em>in mind?</em></h2><p>Tell us a little about what you are hoping to build, restore, or improve. We will be in touch to learn more.</p><div className="contact-detail"><Phone size={18} /><div><span>Prefer to talk?</span><a href="tel:8652163989">865-216-3989</a></div></div></div><LeadForm /></section>
    <ServiceArea />
  </>;
}

function ServiceCard({ service, index, onNavigate }: { service: Service; index: number; onNavigate: (href: string) => void }) {
  const Icon = service.icon;
  return <button className="service-card" onClick={() => onNavigate(`/services/${service.slug}`)}><span className="card-number">0{index + 1}</span><Icon size={28} strokeWidth={1.5} /><span className="card-label">{service.label}</span><h3>{service.title}</h3><p>{service.description}</p><span className="card-arrow"><ArrowRight size={18} /></span></button>;
}

function ServicesPage({ onNavigate }: { onNavigate: (href: string) => void }) {
  return <main><PageHero eyebrow="Our services" title={<>A better home starts with <em>good work.</em></>} copy="From a single room refresh to a whole-home transformation, our work is shaped around how you want to live." /><section className="services section services-page-grid"><div className="service-grid">{services.map((service, index) => <ServiceCard key={service.slug} service={service} index={index} onNavigate={onNavigate} />)}</div></section><section className="estimate section compact-estimate" id="estimate"><div className="estimate-intro"><div className="section-kicker">Start a conversation</div><h2>Let's make a <em>plan.</em></h2><p>Share the basics and we will follow up to talk through your project.</p></div><LeadForm /></section></main>;
}

function ServicePage({ service, onNavigate }: { service: Service; onNavigate: (href: string) => void }) {
  const Icon = service.icon;
  return <main><PageHero eyebrow={service.label} title={<>{service.title} for the way <em>you live.</em></>} copy={service.description} icon={<Icon size={32} />} /><section className="detail-section section"><div className="detail-copy"><div className="section-kicker">A thoughtful approach</div><h2>Beautiful details. <em>Solid work.</em></h2><p>We bring a careful eye and a practical mindset to every project. That means clear communication, honest recommendations, and craftsmanship that holds up long after the final walk-through.</p><p>From the first conversation to the last detail, we keep your home, your timeline, and your priorities at the center.</p><button className="text-link" onClick={() => onNavigate('/about')}>Learn about Roselawn <ArrowRight size={16} /></button></div><div className="detail-list"><div><Check size={18} /><span>Clear scope and straightforward communication</span></div><div><Check size={18} /><span>Respectful work in your home</span></div><div><Check size={18} /><span>Quality-minded finishing details</span></div><div><Check size={18} /><span>Licensed Oregon contractor · CCB #229718</span></div></div></section><section className="estimate section" id="estimate"><div className="estimate-intro"><div className="section-kicker">Start a conversation</div><h2>Ready to talk <em>details?</em></h2><p>Tell us what you are thinking and we will get back to you.</p></div><LeadForm defaultService={service.title} /></section></main>;
}

function AboutPage({ onNavigate }: { onNavigate: (href: string) => void }) {
  return <main><PageHero eyebrow="About Roselawn" title={<>Built on care, <em>not shortcuts.</em></>} copy="Roselawn Builders is a local Portland-area contractor focused on thoughtful improvements, honest communication, and homes that work beautifully for the people inside them." /><section className="detail-section section about-layout"><div className="about-mark"><span>R</span><small>Since<br />day one</small></div><div className="detail-copy"><div className="section-kicker">The builder behind the work</div><h2>Home is personal. <em>We treat it that way.</em></h2><p>Great building is more than measurements and materials. It is understanding what matters to you, bringing order to a complicated process, and caring about the small things that make a space feel finished.</p><p>Roselawn Builders serves homeowners throughout the Portland metro with a versatile range of restoration, remodeling, and finish carpentry services.</p><button className="text-link" onClick={() => onNavigate('/#estimate')}>Talk about your project <ArrowRight size={16} /></button></div></section><ServiceArea /></main>;
}

function PageHero({ eyebrow, title, copy, icon }: { eyebrow: string; title: React.ReactNode; copy: string; icon?: React.ReactNode }) {
  return <section className="page-hero"><div className="page-hero-inner"><p className="eyebrow"><span className="eyebrow-line" /> {eyebrow}</p>{icon && <div className="page-hero-icon">{icon}</div>}<h1>{title}</h1><p>{copy}</p></div></section>;
}

function LeadForm({ defaultService = '' }: { defaultService?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: defaultService, message: '' });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const { error: insertError } = await supabase.from('contractor_leads').insert(form);
    if (insertError) {
      setError('We could not send that just yet. Please call us at 865-216-3989.');
    } else {
      setSubmitted(true);
    }
    setSaving(false);
  };

  if (submitted) return <div className="form-success"><div className="success-icon"><Check /></div><h3>Thanks for reaching out.</h3><p>Your project note is on its way. Roselawn Builders will be in touch soon.</p></div>;
  return <form className="lead-form" onSubmit={submit}><div className="form-row"><label>Your name<input required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Jane Smith" /></label><label>Email address<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="jane@email.com" /></label></div><div className="form-row"><label>Phone number<input required type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="(503) 555-0123" /></label><label>Project type<select required value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}><option value="">Choose one</option>{services.map((service) => <option key={service.slug}>{service.title}</option>)}<option>Something else</option></select></label></div><label>Tell us about the project<textarea required minLength={10} rows={4} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="What are you hoping to improve?" /></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary form-submit" disabled={saving}>{saving ? 'Sending…' : 'Send project details'} <ArrowRight size={17} /></button><p className="form-note">No pressure, no obligation. Just a first conversation.</p></form>;
}

function ServiceArea() {
  return <section className="service-area"><div className="section-kicker">Proudly local</div><h2>Serving the <em>Portland metro.</em></h2><div className="location-list">{locations.map((location) => <span key={location}><MapPin size={15} /> {location}</span>)}</div></section>;
}

export default App;
