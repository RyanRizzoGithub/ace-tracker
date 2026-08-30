/* eslint-disable @next/next/no-img-element */
const LOGO_URL =
  "https://github.com/RyanRizzoGithub/thoughtly-assets/blob/main/images/graphics/logo.png?raw=true";

export default function BrandLogo({ height = 36 }: { height?: number }) {
  return (
    <a
      href="https://www.bethoughtly.com"
      className="inline-flex items-center gap-2.5 leading-none"
    >
      <img
        src={LOGO_URL}
        alt="Thoughtly"
        style={{ height, width: "auto", display: "block" }}
      />
    </a>
  );
}
