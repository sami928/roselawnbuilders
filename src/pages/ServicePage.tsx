import { ArrowRight, Check, Phone } from 'lucide-react';
import { PageHero, ServiceArea, ServiceCard } from '@/components/Layout';
import { LeadForm } from '@/components/LeadForm';
import { Link } from '@/router';
import { services, type Service } from '@/content/services';
import { site } from '@/site';

export function ServicePage({ service }: { service: Service }) {
  const Icon = service.icon;
  const related = services.filter((item) => item.slug !== service.slug).slice(0, 3);
  return (
    <>
      <PageHero
        crumbs={[{ name: 'Services', path: '/services' }, { name: service.title, path: `/services/${service.slug}` }]}
        eyebrow={service.label}
        title={service.seoTitle}
        copy={service.description}
        icon={<Icon size={32} />}
      />
      <section className="detail-section section">
        <div className="detail-copy">
          <div className="section-kicker">A thoughtful approach</div>
          <h2>
            Beautiful details. <em>Solid work.</em>
          </h2>
          <p>{service.intro}</p>
          <p>From the first conversation to the last detail, we keep your home, your timeline, and your priorities at the center.</p>
          <a className="text-link" href={site.phoneHref}>
            <Phone size={16} /> Call {site.phone}
          </a>
        </div>
        <div className="detail-list">
          <h3>What’s included</h3>
          {service.highlights.map((item) => (
            <div key={item}>
              <Check size={18} />
              <span>{item}</span>
            </div>
          ))}
          <div>
            <Check size={18} />
            <span>Licensed Oregon contractor · {site.licenseShort}</span>
          </div>
        </div>
      </section>
      <section className="estimate section compact-estimate" id="estimate">
        <div className="estimate-intro">
          <div className="section-kicker">Free estimate</div>
          <h2>
            Ready to talk <em>details?</em>
          </h2>
          <p>Tell us what you are thinking about your {service.title.toLowerCase()} project and we will get back to you.</p>
        </div>
        <LeadForm defaultService={service.title} />
      </section>
      <section className="services section">
        <div className="section-heading">
          <div>
            <div className="section-kicker">Related services</div>
            <h2>
              More ways we <em>can help.</em>
            </h2>
          </div>
          <Link className="text-link" href="/services">
            All services <ArrowRight size={16} />
          </Link>
        </div>
        <div className="service-grid service-grid-3">
          {related.map((item) => (
            <ServiceCard key={item.slug} service={item} index={services.indexOf(item)} />
          ))}
        </div>
      </section>
      <ServiceArea />
    </>
  );
}
