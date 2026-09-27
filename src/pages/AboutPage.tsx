import { ArrowRight } from 'lucide-react';
import { PageHero, ServiceArea } from '@/components/Layout';
import { Link } from '@/router';
import { site } from '@/site';

export function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: 'About', path: '/about' }]}
        eyebrow={`About ${site.name}`}
        title={<>Built on care, <em>not shortcuts.</em></>}
        copy={`${site.name} is a local Portland-area contractor focused on thoughtful improvements, honest communication, and homes that work beautifully for the people inside them.`}
      />
      <section className="detail-section section about-layout">
        <div className="about-mark">
          <span>R</span>
          <small>{site.license}</small>
        </div>
        <div className="detail-copy">
          <div className="section-kicker">The builder behind the work</div>
          <h2>
            Home is personal. <em>We treat it that way.</em>
          </h2>
          <p>Great building is more than measurements and materials. It is understanding what matters to you, bringing order to a complicated process, and caring about the small things that make a space feel finished.</p>
          <p>{site.name} serves homeowners throughout the Portland metro with a versatile range of restoration, remodeling, and finish carpentry services.</p>
          <Link className="text-link" href="/#estimate">
            Talk about your project <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <ServiceArea />
    </>
  );
}
