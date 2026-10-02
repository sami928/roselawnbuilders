/**
 * Past projects shown on /portfolio. Media lives in public/portfolio/<project-slug>/.
 * To add a project, drop its photos/videos in a new folder and add an entry below.
 * Strip location data from phone photos before adding them (see README).
 */

export type Photo = { kind: 'photo'; src: string; thumb: string; width: number; height: number; alt: string; caption: string };
export type Video = { kind: 'video'; src: string; poster: string; width: number; height: number; caption: string; duration: string };
export type Media = Photo | Video;

export type ProjectStage = { title: string; summary: string; media: Media[] };

export type Project = {
  slug: string;
  title: string;
  summary: string;
  scope: string[];
  cover: Photo;
  stages: ProjectStage[];
};

const dir = '/portfolio/side-yard-drainage';
const photo = (name: string, width: number, height: number, alt: string, caption: string): Photo => ({
  kind: 'photo',
  src: `${dir}/${name}.jpg`,
  thumb: `${dir}/${name}-sm.jpg`,
  width,
  height,
  alt,
  caption,
});
const video = (name: string, caption: string, duration: string): Video => ({
  kind: 'video',
  src: `${dir}/${name}.mp4`,
  poster: `${dir}/${name}-poster.jpg`,
  width: 360,
  height: 640,
  caption,
  duration,
});

const landingWide = photo('landing-cutout-wide', 1400, 1867, 'Entry steps with the broken landing slab cut out and the soil beneath exposed', 'Landing cut out at the base of the entry steps');

export const projects: Project[] = [
  {
    slug: 'side-yard-drainage',
    title: 'Side-yard drainage & concrete repair',
    summary:
      'Water had been pooling along this home’s foundation, undermining the walkway and the landing at the side entry. The damaged concrete was cut out and removed, and the ground along the house was excavated and trenched for drainage.',
    scope: ['Concrete removal', 'Excavation', 'Drainage trenching'],
    cover: landingWide,
    stages: [
      {
        title: 'Before',
        summary: 'Cracked, settled walkway slabs and soil washing out against the foundation.',
        media: [video('before-walkthrough', 'Walkthrough of the cracked walkway and washout along the house', '0:25')],
      },
      {
        title: 'Demolition',
        summary: 'Failed slabs and the broken landing were saw-cut and removed, leaving the entry steps in place.',
        media: [
          landingWide,
          photo('landing-cutout', 1400, 1867, 'Close view of the saw-cut opening beside the steps with broken concrete removed', 'Clean saw cuts along the remaining walkway'),
          video('slab-removal', 'Walkway slabs lifted out and hauled off', '0:16'),
        ],
      },
      {
        title: 'Excavation & drainage',
        summary: 'A trench was dug alongside the walkway and the area at the steps was excavated to find where the water collects.',
        media: [
          photo('drain-trench-walkway', 1125, 1500, 'Long, narrow drainage trench dug in the yard alongside the concrete walkway', 'Drain trench running the length of the walkway'),
          video('trench-excavation', 'Trench line along the walkway and foundation', '0:35'),
          photo('step-excavation-water', 1125, 1500, 'Excavated pit beside the entry steps holding standing water', 'Excavation at the steps holding groundwater'),
          photo('step-excavation-overhead', 1125, 1500, 'Overhead view of the excavation at the foot of the steps', 'Overhead view of the step excavation'),
          video('step-excavation', 'Water collecting in the open excavation', '0:13'),
        ],
      },
    ],
  },
];
