import { ArrowRight, BadgeCheck, Check, Phone, Quote, X } from 'lucide-react';
import { LeadForm } from '@/components/LeadForm';
import { ServiceArea, ServiceCard } from '@/components/Layout';
import { Link } from '@/router';
import { services } from '@/content/services';
import { faqs, guarantee, painPoints, processSteps, promises } from '@/content/funnel';
import { site } from '@/site';

/**
 * The single-page sales funnel: hook → problem → promise → offer → proof → process
 * → objections → final call to action. Every section funnels to #estimate.
 */
export function HomePage() {
  const GuaranteeIcon = guarantee.icon;
  return (
    <>
      <section className="funnel-hero">
        <div className="funnel-hero-inner">
          <div className="hero-text">
            <p className="eyebrow">
              <span className="eyebrow-line" /> Portland-area remodeling & restoration
            </p>
            <h1>
              Your home, done right. <em>No runaround.</em>
            </h1>
            <p className="hero-copy">
              Kitchens, bathrooms, siding, and careful restoration from a licensed local builder who returns your call, puts the scope in writing, and finishes what we start.
            </p>
            <ul className="hero-checks">
              <li><Check size={16} /> Free, no-pressure in-home estimate</li>
              <li><Check size={16} /> Clear written scope before work begins</li>
              <li><Check size={16} /> Licensed Oregon contractor · {site.licenseShort}</li>
            </ul>
            <div className="hero-actions">
              <a className="button button-quiet" href={site.phoneHref}>
                <Phone size={17} /> Prefer to talk? {site.phone}
              </a>
            </div>
          </div>
          <div className="hero-form-wrap" id="estimate">
            <LeadForm heading="Get your free estimate" />
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Why homeowners choose us">
        <div><strong>{site.licenseShort}</strong><span>Licensed Oregon contractor</span></div>
        <div><strong>{site.areas.length}</strong><span>Portland-metro communities</span></div>
        <div><strong>{services.length}</strong><span>Core trades under one roof</span></div>
        <div><strong>$0</strong><span>For your first estimate</span></div>
      </section>

      <section className="section pain">
        <div className="section-kicker">Sound familiar?</div>
        <h2>
          Hiring a contractor <em>shouldn’t be this hard.</em>
        </h2>
        <div className="pain-grid">
          {painPoints.map((pain) => (
            <div className="pain-card" key={pain.title}>
              <span className="pain-icon"><X size={16} /></span>
              <h3>{pain.title}</h3>
              <p>{pain.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="quote-band promise-band">
        <div>
          <p className="eyebrow eyebrow-light">
            <span className="eyebrow-line" /> The Roselawn way
          </p>
          <h2>
            A builder who treats your home <em>like it matters.</em>
          </h2>
          <Link className="button button-primary" href="/#estimate">
            Start my free estimate <ArrowRight size={17} />
          </Link>
        </div>
        <ul className="promise-list">
          {promises.map(({ title, copy, icon: Icon }) => (
            <li key={title}>
              <Icon size={22} strokeWidth={1.6} />
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="services section">
        <div className="section-heading">
          <div>
            <div className="section-kicker">What we build</div>
            <h2>
              Work that makes <em>home feel right.</em>
            </h2>
          </div>
          <Link className="text-link" href="/services">
            View all services <ArrowRight size={16} />
          </Link>
        </div>
        <div className="service-grid service-grid-3">
          {services.map((service, index) => (
            <ServiceCard key={service.slug} service={service} index={index} />
          ))}
        </div>
      </section>

      <section className="section process">
        <div className="section-kicker">How it works</div>
        <h2>
          From first call to final walkthrough, <em>in four steps.</em>
        </h2>
        <ol className="process-grid">
          {processSteps.map(({ title, copy, icon: Icon }, index) => (
            <li key={title}>
              <span className="process-number">{String(index + 1).padStart(2, '0')}</span>
              <Icon size={24} strokeWidth={1.5} />
              <h3>{title}</h3>
              <p>{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      {site.testimonials.length > 0 && (
        <section className="section testimonials">
          <div className="section-kicker">From our clients</div>
          <h2>
            Homeowners who <em>stopped worrying.</em>
          </h2>
          <div className="testimonial-grid">
            {site.testimonials.map((review) => (
              <figure key={review.name + review.project}>
                <Quote size={22} />
                <blockquote>{review.quote}</blockquote>
                <figcaption>
                  <strong>{review.name}</strong> · {review.location} · {review.project}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="guarantee">
        <GuaranteeIcon size={30} strokeWidth={1.5} />
        <div>
          <h2>{guarantee.title}</h2>
          <p>{guarantee.copy}</p>
        </div>
        <a className="button button-primary" href={site.googleBusinessUrl} target="_blank" rel="noreferrer">
          <BadgeCheck size={17} /> See us on Google
        </a>
      </section>

      <section className="section faq">
        <div className="faq-intro">
          <div className="section-kicker">Questions, answered</div>
          <h2>
            Before you <em>reach out.</em>
          </h2>
          <p>Still wondering about something? Call us at <a href={site.phoneHref}>{site.phone}</a> — a real person will pick up.</p>
        </div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta">
        <div className="final-cta-inner">
          <div>
            <p className="eyebrow eyebrow-light">
              <span className="eyebrow-line" /> Ready when you are
            </p>
            <h2>
              Let’s talk about <em>your project.</em>
            </h2>
            <p>Tell us what you have in mind. We will follow up to schedule a free visit and give you a clear, written estimate.</p>
            <a className="final-phone" href={site.phoneHref}>
              <Phone size={18} /> {site.phone}
            </a>
          </div>
          <LeadForm heading="Request your free estimate" />
        </div>
      </section>

      <ServiceArea />
    </>
  );
}
