import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, ChevronDown, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { Link, useRouter } from '@/router';
import { services } from '@/content/services';
import { site } from '@/site';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <MobileCtaBar />
    </div>
  );
}

function Header() {
  const { path } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [path]);

  return (
    <header className="site-header">
      <div className="announcement">
        <span className="announcement-dot" /> Serving the greater Portland area · {site.licenseShort}
      </div>
      <div className="nav-wrap">
        <Link className="brand" href="/" aria-label={`${site.name} home`}>
          <img src={site.logo} alt={site.name} width={202} height={68} />
        </Link>
        <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
          <Link href="/">Home</Link>
          <div className="nav-dropdown">
            <Link href="/services">
              Services <ChevronDown size={14} />
            </Link>
            <div className="dropdown-panel">
              {services.map((service) => (
                <Link key={service.slug} href={`/services/${service.slug}`}>
                  {service.title}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/about">About</Link>
          <a href={site.phoneHref} className="nav-phone">
            <Phone size={14} /> {site.phone}
          </a>
          <Link className="nav-mobile-cta" href="/#estimate">
            Get a free estimate
          </Link>
        </nav>
        <Link className="header-cta" href="/#estimate">
          Free estimate <ArrowRight size={16} />
        </Link>
        <button className="menu-toggle" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src={site.logo} alt={site.name} width={192} height={66} loading="lazy" />
          <p>{site.tagline}</p>
        </div>
        <div>
          <p className="footer-label">Services</p>
          {services.map((service) => (
            <Link key={service.slug} href={`/services/${service.slug}`}>
              {service.title}
            </Link>
          ))}
        </div>
        <div>
          <p className="footer-label">Company</p>
          <Link href="/about">About {site.name}</Link>
          <Link href="/#estimate">Free estimate</Link>
          <a href={site.googleBusinessUrl} target="_blank" rel="noreferrer">
            Google Business
          </a>
        </div>
        <div>
          <p className="footer-label">Get in touch</p>
          <a href={site.phoneHref}>
            <Phone size={15} /> {site.phone}
          </a>
          <a href={`mailto:${site.email}`}>
            <Mail size={15} /> {site.email}
          </a>
          <span>
            <MapPin size={15} /> {site.region}
          </span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <span>{site.license}</span>
        <span>Serving {site.areas.join(' · ')}</span>
      </div>
    </footer>
  );
}

function MobileCtaBar() {
  return (
    <div className="mobile-cta-bar">
      <a href={site.phoneHref}>
        <Phone size={16} /> Call
      </a>
      <Link href="/#estimate">
        Free estimate <ArrowRight size={16} />
      </Link>
    </div>
  );
}

export function PageHero({ eyebrow, title, copy, icon, crumbs }: { eyebrow: string; title: ReactNode; copy: string; icon?: ReactNode; crumbs?: { name: string; path: string }[] }) {
  return (
    <section className="page-hero">
      <div className="page-hero-inner">
        {crumbs && (
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            {crumbs.map((crumb, index) => (
              <span key={crumb.path}>
                <span aria-hidden="true">/</span>
                {index === crumbs.length - 1 ? <span aria-current="page">{crumb.name}</span> : <Link href={crumb.path}>{crumb.name}</Link>}
              </span>
            ))}
          </nav>
        )}
        <p className="eyebrow">
          <span className="eyebrow-line" /> {eyebrow}
        </p>
        {icon && <div className="page-hero-icon">{icon}</div>}
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
    </section>
  );
}

export function ServiceArea() {
  return (
    <section className="service-area">
      <div className="section-kicker">Proudly local</div>
      <h2>
        Serving the <em>Portland metro.</em>
      </h2>
      <ul className="location-list">
        {site.areas.map((location) => (
          <li key={location}>
            <MapPin size={15} /> {location}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ServiceCard({ service, index }: { service: (typeof services)[number]; index: number }) {
  const Icon = service.icon;
  return (
    <Link className="service-card" href={`/services/${service.slug}`}>
      <span className="card-number">0{index + 1}</span>
      <Icon size={28} strokeWidth={1.5} />
      <span className="card-label">{service.label}</span>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <span className="card-arrow">
        <ArrowRight size={18} />
      </span>
    </Link>
  );
}
