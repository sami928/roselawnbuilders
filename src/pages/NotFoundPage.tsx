import { ArrowRight } from 'lucide-react';
import { Link } from '@/router';

export function NotFoundPage() {
  return (
    <section className="thank-you">
      <p className="eyebrow">
        <span className="eyebrow-line" /> Error 404
      </p>
      <h1>
        This page is <em>under construction.</em>
      </h1>
      <p>We couldn’t find the page you were looking for. It may have moved, or the link may be out of date.</p>
      <div className="hero-actions">
        <Link className="button button-primary" href="/">
          Back to home <ArrowRight size={17} />
        </Link>
        <Link className="button button-quiet" href="/services">
          Our services
        </Link>
      </div>
    </section>
  );
}
