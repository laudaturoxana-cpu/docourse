import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, showText = true, size = "md" }: LogoProps) => {
  const sizes = {
    sm: { icon: 28, text: "text-lg" },
    md: { icon: 36, text: "text-xl" },
    lg: { icon: 48, text: "text-2xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Book base - navy */}
        <path
          d="M6 12C6 10.8954 6.89543 10 8 10H20C22.2091 10 24 11.7909 24 14V38C24 36.3431 22.6569 35 21 35H8C6.89543 35 6 34.1046 6 33V12Z"
          fill="#1C2A3A"
        />
        <path
          d="M42 12C42 10.8954 41.1046 10 40 10H28C25.7909 10 24 11.7909 24 14V38C24 36.3431 25.3431 35 27 35H40C41.1046 35 42 34.1046 42 33V12Z"
          fill="#1C2A3A"
        />
        
        {/* Digital screen overlay - gold accent */}
        <rect
          x="14"
          y="6"
          width="20"
          height="14"
          rx="2"
          fill="#C8A974"
        />
        
        {/* Screen lines */}
        <rect x="17" y="10" width="14" height="2" rx="1" fill="#1C2A3A" opacity="0.3" />
        <rect x="17" y="14" width="10" height="2" rx="1" fill="#1C2A3A" opacity="0.3" />
        
        {/* Play button on screen */}
        <path
          d="M22 11L27 14L22 17V11Z"
          fill="#1C2A3A"
          opacity="0.6"
        />
        
        {/* Book pages detail */}
        <path
          d="M24 16V36"
          stroke="#C8A974"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        
        {/* Gold accent lines on book */}
        <path
          d="M10 18H18"
          stroke="#C8A974"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10 22H16"
          stroke="#C8A974"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10 26H18"
          stroke="#C8A974"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M30 22H38"
          stroke="#C8A974"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M32 26H38"
          stroke="#C8A974"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M30 30H36"
          stroke="#C8A974"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      
      {showText && (
        <span className={cn("font-bold tracking-tight text-navy", text)}>
          Do<span className="text-gold">Course</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
