import Image from 'next/image';
import type { CSSProperties } from 'react';
import { AudioLines, Play } from 'lucide-react';
import { djSets } from '@/content/music';

export function Sets() {
 return <section className="section sets-section" id="sets">
  <div className="section-top"><p className="eyebrow">04 / My DJ sets</p><AudioLines size={26} strokeWidth={1} aria-hidden="true"/></div>
  <div className="section-title"><h2>One sound.<br/><em>Three dimensions.</em></h2><p>For the mind that wanders.<br/>The body that moves.<br/>The soul that connects.</p></div>
  <div className="sets-grid">{djSets.map((set,index) => <article className={`set-card set-${set.id}`} key={set.id} style={{'--set-color':set.color} as CSSProperties}>
   <a className="set-art" href={set.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${set.title} on YouTube (opens in a new tab)`}>
    <Image src={set.image} alt={set.subtitle+' artwork'} width={500} height={500} sizes="(max-width: 760px) 86vw, 300px"/>
    <span className="set-play" aria-hidden="true"><Play size={23} fill="currentColor" strokeWidth={1}/></span>
   </a>
   <div className="set-heading"><h3>{set.title}</h3><span>0{index+1}</span></div><p className="set-genres">{set.genres}</p><p className="set-description">{set.description}</p>
  </article>)}</div>
 </section>;
}
