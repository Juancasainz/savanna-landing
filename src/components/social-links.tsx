import Image from 'next/image';

const socials = [
  { name: 'Instagram', href: 'https://www.instagram.com/savanna_sound/', icon: 'instagram.png', style: 'padded' },
  { name: 'YouTube', href: 'https://www.youtube.com/@savanna_sound', icon: 'youtube.png', style: 'padded' },
  { name: 'SoundCloud', href: 'https://soundcloud.com/savanna_sound', icon: 'soundcloud.png', style: 'soundcloud' },
  { name: 'Spotify', href: 'https://open.spotify.com/artist/4EeYd8BvnVjrbnNLcfCNJ0', icon: 'spotify.webp', style: 'spotify' },
  { name: 'Resident Advisor', href: 'https://ra.co/dj/savanna', icon: 'resident-advisor.png', style: 'resident-advisor' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@savanna_sound', icon: 'tiktok.png', style: 'padded' },
  { name: 'Facebook', href: 'https://www.facebook.com/savanna.dj', icon: 'facebook.png', style: 'padded' },
] as const;

export function SocialLinks({ label = 'Savanna on social media' }: { label?: string }) {
  return (
    <nav className="social-links" aria-label={label}>
      {socials.map(({ name, href, icon, style }) => (
        <a
          key={name}
          className="social-link"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} (opens in a new tab)`}
          title={name}
        >
          <Image
            className={`social-icon social-icon--${style}`}
            src={`/images/social/${icon}`}
            alt=""
            width={44}
            height={44}
            unoptimized
          />
        </a>
      ))}
    </nav>
  );
}
