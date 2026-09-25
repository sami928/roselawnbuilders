import { ArrowRight, Check, Phone } from 'lucide-react';
import { Link } from '@/router';
import { site } from '@/site';

/** Conversion page — point your ad platform's "lead" goal at /thank-you. */
export function ThankYouPage() {
  return (
    <section className="thank-you">
      <div className="success-icon">
        <Check />
      </div>
      <p className="eyebrow">
        <span className="eyebrow-line" /> Request received
      </p>
      <h1>
        Thanks — we’ve got <em>your project details.</em>
      </h1>
      <p>We’ll review what you sent and reach out shortly to schedule your free estimate. If it’s urgent, give us a call.</p>
      <ol className="next-steps">
        <li><strong>1</strong> We review your project</li>
        <li><strong>2</strong> We call to schedule a visit</li>
        <li><strong>3</strong> You get a written estimate</li>
      </ol>
      <div className="hero-actions">
        <a className="button button-primary" href={site.phoneHref}>
          <Phone size={17} /> {site.phone}
        </a>
        <Link className="button button-quiet" href="/services">
          Browse our services <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}
