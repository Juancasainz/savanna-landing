import Image from 'next/image';
import { Disc3, Play } from 'lucide-react';
import { releases } from '@/content/music';
export { Sets } from './sets';

export function Music() {
 return <section className="section music-section" id="music"><div className="section-top"><p className="eyebrow">03 / My music</p><Disc3 size={26} strokeWidth={1} aria-hidden="true"/></div><div className="section-title"><h2>Rooted in earth.<br/><em>Made to move you.</em></h2><p>Organic textures, deep melodies<br/>and a little otherworldly energy.</p></div><div className="release-grid">{releases.map((release, index) => { const destination = release.youtubeUrl || release.url; const platform = release.youtubeUrl || release.platform === 'YouTube' ? 'YouTube' : 'SoundCloud'; return <article className="release" key={release.title}><a className="release-art" href={destination} target="_blank" rel="noopener noreferrer" aria-label={`${release.title}: open on ${platform} (opens in a new tab)`}><Image src={release.image} alt={`${release.title} release artwork`} width={500} height={500} sizes="(max-width: 760px) 42vw, 280px"/><span className="release-number">0{index+1}</span><span className="release-play" aria-hidden="true"><Play size={19} fill="currentColor" strokeWidth={1}/></span></a><div className="release-meta"><span>{release.label}</span><time dateTime={release.releaseDate}>{release.releaseDate.slice(0,4)}</time></div><h3>{release.title}</h3><p>{release.collection}</p></article>})}</div></section>;
}
