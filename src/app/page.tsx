import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Atom, Eclipse, Orbit } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Music, Sets } from '@/components/music';
import { SocialLinks } from '@/components/social-links';

export default function Home() {
 return <><Header/><main id="main">
  <section className="hero" id="home">
    <div className="hero-visual"><Image src="/images/savanna-hero-cosmic.png" alt="Savanna smiling behind the decks, surrounded by purple and blue light" fill priority sizes="100vw"/><div className="hero-photo-tint"/></div>
    <div className="hero-content"><p className="eyebrow">An invitation to feel connected</p><h1>SΛVΛNNΛ</h1><p className="hero-statement">Rooted in rhythm.<br/><em>Connected through sound.</em></p><p className="hero-description">Tribal soul. Progressive journeys.<br/>A shared dance through the cosmos.</p><div className="hero-actions"><Link className="button button-rust" href="/contact">Contact me <ArrowUpRight size={19}/></Link><a className="hero-listen" href="#sets">Explore my sound <ArrowDown size={17}/></a></div><div className="hero-bottom"><SocialLinks label="Savanna social media — hero"/><a className="hero-discover" href="#about" aria-label="Discover more about Savanna"><ArrowDown size={18}/></a></div></div>
  </section>
  <div className="genre-band" aria-label="Musical styles"><span>Progressive house</span><span>Organic downtempo</span><span>Tribal</span><span>Indie dance</span></div>
  <section className="section about-section" id="about"><div className="about-photo"><Image src="/images/savanna-about-studio.jpg" alt="Savanna seated in a meditative pose, in soft violet and warm light" fill sizes="(max-width: 760px) 90vw, 40vw"/><span className="portrait-caption">ROOTS ON EARTH / MIND IN THE COSMOS</span></div><div className="about-copy"><div className="section-top"><p className="eyebrow">01 / About me</p><Atom size={26} strokeWidth={1} aria-hidden="true"/></div><h2>Many roots.<br/><em>One shared feeling.</em></h2>
    <p className="lead"><strong>Savanna</strong> is a Bolivian-Argentinian DJ and producer based in Madrid, raised <strong>between the Amazon and the Andes</strong>. Her sound blends <strong>progressive house, organic textures and tribal percussion</strong> into immersive electronic journeys.</p>
    <p>With releases on international labels such as <strong>Café de Anatolia and Baikal Nomads</strong>, and performances across <strong>Europe, Africa and Latin America</strong>, Savanna has developed a musical identity rooted in storytelling, rhythm and collective energy.</p>
    <p>For Savanna, every set is a meeting place: a space to reconnect with our roots, with nature and with <strong>something bigger than ourselves.</strong></p>
  </div></section>
  <section className="section presence-section" id="presence"><div className="section-top"><p className="eyebrow">02 / Presence</p><Orbit size={26} strokeWidth={1} aria-hidden="true"/></div><div className="section-title"><h2>A shared rhythm.<br/><em>Across borders.</em></h2><p>Different places, familiar energy.<br/>A few stops along the journey.</p></div><div className="presence-grid"><div><h3>STAGES</h3><ul className="stages"><li>The Soundgarden</li><li>Brunch Electronik</li><li>Brunch In The Park</li><li>Pacha Ibiza</li><li>Space of Sound</li></ul></div><div><h3>CITIES</h3><p className="cities">Madrid <span>·</span> Ibiza <span>·</span> Barcelona <span>·</span> Miami <span>·</span> Buenos Aires <span>·</span> Berlin <span>·</span> Valencia <span>·</span> Málaga <span>·</span> Marbella <span>·</span> Essaouira <span>·</span> Rabat <span>·</span> Santa Cruz <span>·</span> La Paz <span>·</span> Sicily</p></div></div><div className="lineups"><h3>SHARED LINEUPS WITH</h3><p>Nick Warren <span>·</span> Rodriguez Jr. <span>·</span> Keinemusik <span>·</span> Boris Brejcha <span>·</span> Birds of Mind <span>·</span> Hunter/Game <span>·</span> Francis Mercier <span>·</span> Mariano Mellino <span>·</span> Mai Lawson <span>·</span> Paradoks <span>·</span> Fur Coat <span>·</span> Lopezhouse <span>·</span> Rodrigo Gallardo <span>·</span> Matias Aguayo</p></div></section>
  <Music/><Sets/>
  <section className="connect-section"><Eclipse className="section-symbol" size={30} strokeWidth={1} aria-hidden="true"/><p className="eyebrow">Bookings & collaborations</p><h2>Let’s connect</h2><Link href="/contact" className="button button-rust">Contact me <ArrowUpRight size={19}/></Link></section>
 </main><Footer/></>;
}
