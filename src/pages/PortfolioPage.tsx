import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ChevronLeft, ChevronRight, Expand, Play, X } from 'lucide-react';
import { PageHero } from '@/components/Layout';
import { LeadForm } from '@/components/LeadForm';
import { projects, type Photo, type Project, type Video } from '@/content/portfolio';
import { site } from '@/site';

export function PortfolioPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: 'Our work', path: '/portfolio' }]}
        eyebrow="Portfolio"
        title={<>Past projects, <em>start to finish.</em></>}
        copy="Photos and video from the field, organized by each stage of the work."
      />
      <div className="portfolio-jump">
        <a href="#contact">
          Have a similar project? Get in touch <ArrowDown size={15} />
        </a>
      </div>
      {projects.map((project, index) => (
        <ProjectCaseStudy key={project.slug} project={project} number={index + 1} />
      ))}
      <section className="estimate section compact-estimate portfolio-contact" id="contact">
        <div className="estimate-intro">
          <div className="section-kicker">Contact</div>
          <h2>
            Tell us about <em>your project.</em>
          </h2>
          <p>
            Send a few details and we’ll follow up. You can also call <a href={site.phoneHref}>{site.phone}</a>.
          </p>
        </div>
        <LeadForm heading="Request an estimate" />
      </section>
    </>
  );
}

function ProjectCaseStudy({ project, number }: { project: Project; number: number }) {
  const photos = project.stages.flatMap((stage) => stage.media.filter((item): item is Photo => item.kind === 'photo'));
  const [open, setOpen] = useState<number | null>(null);

  return (
    <article className="case-study section" id={project.slug} aria-labelledby={`${project.slug}-title`}>
      <header className="case-header">
        <span className="case-number">{String(number).padStart(2, '0')}</span>
        <div>
          <h2 id={`${project.slug}-title`}>{project.title}</h2>
          <p>{project.summary}</p>
          <ul className="case-scope" aria-label="Scope of work">
            {project.scope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </header>

      <ol className="case-stages">
        {project.stages.map((stage, stageIndex) => (
          <li key={stage.title} className="case-stage">
            <div className="stage-label">
              <span className="stage-step">Stage {stageIndex + 1}</span>
              <h3>{stage.title}</h3>
              <p>{stage.summary}</p>
            </div>
            <div className={`stage-media count-${Math.min(stage.media.length, 5)}`}>
              {stage.media.map((item) =>
                item.kind === 'photo' ? (
                  <PhotoTile key={item.src} photo={item} onOpen={() => setOpen(photos.indexOf(item))} />
                ) : (
                  <VideoTile key={item.src} video={item} />
                ),
              )}
            </div>
          </li>
        ))}
      </ol>

      {open !== null && <Lightbox photos={photos} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </article>
  );
}

function PhotoTile({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  return (
    <figure className="media-tile">
      <button type="button" className="media-frame" onClick={onOpen} aria-label={`View larger: ${photo.caption}`}>
        <img src={photo.thumb} srcSet={`${photo.thumb} 600w, ${photo.src} ${photo.width}w`} sizes="(max-width: 680px) 100vw, 33vw" width={photo.width} height={photo.height} alt={photo.alt} loading="lazy" decoding="async" />
        <span className="media-badge" aria-hidden="true">
          <Expand size={14} />
        </span>
      </button>
      <figcaption>{photo.caption}</figcaption>
    </figure>
  );
}

function VideoTile({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  return (
    <figure className="media-tile">
      <div className="media-frame is-video">
        {playing ? (
          // Clips have no audio track; they're muted so mobile browsers allow inline playback.
          <video src={video.src} poster={video.poster} width={video.width} height={video.height} controls autoPlay muted playsInline preload="metadata" />
        ) : (
          <button type="button" className="video-poster" onClick={() => setPlaying(true)} aria-label={`Play video: ${video.caption}`}>
            <img src={video.poster} width={video.width} height={video.height} alt="" loading="lazy" decoding="async" />
            <span className="play-button" aria-hidden="true">
              <Play size={22} fill="currentColor" />
            </span>
            <span className="media-badge duration">{video.duration}</span>
          </button>
        )}
      </div>
      <figcaption>{video.caption}</figcaption>
    </figure>
  );
}

function Lightbox({ photos, index, onChange, onClose }: { photos: Photo[]; index: number; onChange: (index: number) => void; onClose: () => void }) {
  const photo = photos[index];
  const step = useCallback((delta: number) => onChange((index + delta + photos.length) % photos.length), [index, onChange, photos.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, step]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={photo.caption} onClick={onClose}>
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close" autoFocus>
        <X size={22} />
      </button>
      {photos.length > 1 && (
        <>
          <button type="button" className="lightbox-nav prev" onClick={(event) => { event.stopPropagation(); step(-1); }} aria-label="Previous photo">
            <ChevronLeft size={26} />
          </button>
          <button type="button" className="lightbox-nav next" onClick={(event) => { event.stopPropagation(); step(1); }} aria-label="Next photo">
            <ChevronRight size={26} />
          </button>
        </>
      )}
      <figure onClick={(event) => event.stopPropagation()}>
        <img src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} />
        <figcaption>
          <span>{photo.caption}</span>
          <span className="lightbox-count">
            {index + 1} / {photos.length}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
