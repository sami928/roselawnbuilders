import { PageHero, ServiceArea, ServiceCard } from '@/components/Layout';
import { LeadForm } from '@/components/LeadForm';
import { services } from '@/content/services';

export function ServicesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: 'Services', path: '/services' }]}
        eyebrow="Our services"
        title={<>Remodeling & construction services in <em>Portland.</em></>}
        copy="From a single room refresh to a whole-home transformation, our work is shaped around how you want to live."
      />
      <section className="services section services-page-grid">
        <div className="service-grid service-grid-3">
          {services.map((service, index) => (
            <ServiceCard key={service.slug} service={service} index={index} />
          ))}
        </div>
      </section>
      <section className="estimate section compact-estimate" id="estimate">
        <div className="estimate-intro">
          <div className="section-kicker">Start a conversation</div>
          <h2>
            Let’s make a <em>plan.</em>
          </h2>
          <p>Share the basics and we will follow up to talk through your project.</p>
        </div>
        <LeadForm />
      </section>
      <ServiceArea />
    </>
  );
}
