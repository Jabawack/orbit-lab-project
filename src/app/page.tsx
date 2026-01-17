import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'orbit-lab-project | Home',
};

interface ModeCard {
  title: string;
  description: string;
  href: string;
  status: 'active' | 'coming-soon';
  icon: string;
}

const modes: ModeCard[] = [
  {
    title: 'Flight Tracker',
    description: 'Real-time aircraft visualization using OpenSky Network API',
    href: '/flights',
    status: 'active',
    icon: '✈️',
  },
  {
    title: 'Satellites',
    description: 'Track satellites and space stations in orbit',
    href: '/satellites',
    status: 'coming-soon',
    icon: '🛰️',
  },
  {
    title: 'Star Map',
    description: 'Explore celestial objects and constellations',
    href: '/stars',
    status: 'coming-soon',
    icon: '⭐',
  },
  {
    title: 'Data Viz',
    description: 'Custom geographic data visualization',
    href: '/data',
    status: 'coming-soon',
    icon: '📊',
  },
];

export default function HomePage() {
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.title}>orbit-lab-project</h1>
          <p style={styles.subtitle}>
            A reusable 3D globe visualization framework
          </p>
        </header>

        {/* Mode Cards */}
        <div style={styles.grid}>
          {modes.map((mode) => (
            <ModeCardComponent key={mode.title} mode={mode} />
          ))}
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>
            Built with{' '}
            <a
              href="https://github.com/pmndrs/react-three-fiber"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              React Three Fiber
            </a>{' '}
            +{' '}
            <a
              href="https://github.com/vasturiano/three-globe"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              three-globe
            </a>
          </p>
          <p style={styles.version}>v0.1.0</p>
        </footer>
      </div>
    </main>
  );
}

function ModeCardComponent({ mode }: { mode: ModeCard }) {
  const isActive = mode.status === 'active';

  const cardContent = (
    <div
      style={{
        ...styles.card,
        ...(isActive ? {} : styles.cardDisabled),
      }}
    >
      <div style={styles.cardIcon}>{mode.icon}</div>
      <h2 style={styles.cardTitle}>{mode.title}</h2>
      <p style={styles.cardDescription}>{mode.description}</p>
      {!isActive && <span style={styles.badge}>Coming Soon</span>}
    </div>
  );

  if (isActive) {
    return <Link href={mode.href}>{cardContent}</Link>;
  }

  return cardContent;
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
    padding: 20,
  },
  container: {
    maxWidth: 900,
    width: '100%',
    textAlign: 'center',
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: 200,
    letterSpacing: '0.3em',
    textTransform: 'lowercase',
    marginBottom: 12,
    background: 'linear-gradient(135deg, #fff 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 300,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 20,
    marginBottom: 48,
  },
  card: {
    padding: 24,
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
  },
  cardDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 500,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 1.5,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 10,
    padding: '4px 8px',
    borderRadius: 4,
    background: 'rgba(59, 130, 246, 0.3)',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  footer: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 13,
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'underline',
  },
  version: {
    marginTop: 8,
    fontSize: 11,
    opacity: 0.6,
  },
};
