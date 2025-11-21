interface LogoProps {
  variant?: 'full' | 'icon' | 'white';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 48,
};

export function Logo({ variant = 'full', size = 'md', className = '' }: LogoProps) {
  const dimensions = sizeMap[size];

  // Choose the logo file based on variant - prefer SVG for better quality and smaller size
  const logoSrc = variant === 'icon'
    ? '/logo-icon.png'
    : variant === 'white'
    ? '/logo-white.png'
    : '/logo-full.svg';

  return (
    <div
      className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-1 flex items-center justify-center"
      style={{ width: dimensions, height: dimensions }}
    >
      <img
        src={logoSrc}
        alt="Cointribute Logo"
        className={`${className} object-contain w-full h-full`}
      />
    </div>
  );
}
