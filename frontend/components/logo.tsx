import Image from "next/image";
import { cn } from "../lib/utils";

export const Logo = ({
  className,
  src = "/tripsync_logo_v2.svg",
  alt = "TripSync",
}: {
  className?: string;
  src?: string;
  alt?: string;
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={260}
      height={130}
      sizes="(max-width: 640px) 160px, (max-width: 1024px) 220px, 260px"
      className={cn("h-auto w-40 object-contain sm:w-48 lg:w-52", className)}
      priority
    />
  );
};

export const LogoGlobe = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="72 92 168 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-auto w-9", className)}
      aria-hidden="true"
    >
      <g transform="translate(156 155) scale(0.84) translate(-156 -155)">
        <circle
          cx="156"
          cy="155"
          r="72"
          fill="none"
          stroke="#534AB7"
          strokeWidth="3.2"
        />
        <ellipse
          cx="156"
          cy="155"
          rx="72"
          ry="22"
          fill="none"
          stroke="#B4B2A9"
          strokeWidth="1.4"
        />
        <ellipse
          cx="156"
          cy="127"
          rx="60"
          ry="14"
          fill="none"
          stroke="#B4B2A9"
          strokeWidth="1"
          opacity="0.6"
        />
        <ellipse
          cx="156"
          cy="183"
          rx="60"
          ry="14"
          fill="none"
          stroke="#B4B2A9"
          strokeWidth="1"
          opacity="0.6"
        />
        <ellipse
          cx="156"
          cy="155"
          rx="26"
          ry="72"
          fill="none"
          stroke="#B4B2A9"
          strokeWidth="1.4"
        />
        <line
          x1="156"
          y1="83"
          x2="156"
          y2="227"
          stroke="#B4B2A9"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
        <ellipse
          cx="156"
          cy="155"
          rx="95"
          ry="30"
          fill="none"
          stroke="#1D9E75"
          strokeWidth="2.6"
          strokeDasharray="7 4"
          transform="rotate(-30 156 155)"
        />
        <circle cx="218" cy="118" r="8" fill="#1D9E75" />
        <circle cx="218" cy="118" r="14" fill="#1D9E75" opacity="0.15" />
        <circle cx="90" cy="188" r="6" fill="#534AB7" />
        <circle cx="90" cy="188" r="11" fill="#534AB7" opacity="0.15" />
      </g>
    </svg>
  );
};
export const LogoIcon = ({
  className,
  uniColor,
}: {
  className?: string;
  uniColor?: boolean;
}) => {
  return (
    <svg
      width="24"
      height="24" // Increased dimensions
      viewBox="0 0 24 24" // Increased viewBox
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-6", className)}
    >
      {/* Travel sync icon - combining location pins with sync arrows */}
      <g fill={uniColor ? "currentColor" : "url(#logo-gradient)"}>
        {/* Location pin 1 */}
        <path d="M5 3C3.9 3 3 3.9 3 5C3 7.5 5 9 5 9S7 7.5 7 5C7 3.9 6.1 3 5 3ZM5 6C4.4 6 4 5.6 4 5C4 4.4 4.4 4 5 4C5.6 4 6 4.4 6 5C6 5.6 5.6 6 5 6Z" />

        {/* Location pin 2 */}
        <path d="M17 11C15.9 11 15 11.9 15 13C15 15.5 17 17 17 17S19 15.5 19 13C19 11.9 18.1 11 17 11ZM17 14C16.4 14 16 13.6 16 13C16 12.4 16.4 12 17 12C17.6 12 18 12.4 18 13C18 13.6 17.6 14 17 14Z" />

        {/* Sync arrows connecting the locations */}
        <path d="M8 8L12 8L10 6L14 10L10 14L12 12L8 12C7.4 12 7 11.6 7 11C7 10.4 7.4 10 8 10Z" />
        <path d="M14 14L10 14L12 16L8 12L12 8L10 10L14 10C14.6 10 15 10.4 15 11C15 11.6 14.6 12 14 12Z" />
      </g>
      <defs>
        <linearGradient
          id="logo-gradient"
          x1="10"
          y1="0"
          x2="10"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9B99FE" />
          <stop offset="1" stopColor="#2BC8B7" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const LogoStroke = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("size-8 w-8", className)} // Increased size
      viewBox="0 0 71 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M61.25 1.625L70.75 1.5625C70.75 4.77083 70.25 7.79167 69.25 10.625C68.2917 13.4583 66.8958 15.9583 65.0625 18.125C63.2708 20.25 61.125 21.9375 58.625 23.1875C56.1667 24.3958 53.4583 25 50.5 25C46.875 25 43.6667 24.2708 40.875 22.8125C38.125 21.3542 35.125 19.2083 31.875 16.375C29.75 14.4167 27.7917 12.8958 26 11.8125C24.2083 10.7292 22.2708 10.1875 20.1875 10.1875C18.0625 10.1875 16.25 10.7083 14.75 11.75C13.25 12.75 12.0833 14.1875 11.25 16.0625C10.4583 17.9375 10.0625 20.1875 10.0625 22.8125L0 22.9375C0 19.6875 0.479167 16.6667 1.4375 13.875C2.4375 11.0833 3.83333 8.64583 5.625 6.5625C7.41667 4.47917 9.54167 2.875 12 1.75C14.5 0.583333 17.2292 0 20.1875 0C23.8542 0 27.1042 0.770833 29.9375 2.3125C32.8125 3.85417 35.7708 5.97917 38.8125 8.6875C41.1042 10.7708 43.1042 12.3333 44.8125 13.375C46.5625 14.375 48.4583 14.875 50.5 14.875C52.6667 14.875 54.5417 14.3125 56.125 13.1875C57.75 12.0625 59 10.5 59.875 8.5C60.7917 6.5 61.25 4.20833 61.25 1.625Z"
        fill="none"
        strokeWidth={0.5}
        stroke="currentColor"
      />
    </svg>
  );
};
