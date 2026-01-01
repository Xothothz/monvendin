import Link from "next/link";
import clsx from "clsx";

type PageTitleProps = {
  title: string;
  href?: string;
  align?: "left" | "center";
  watermark?: string;
};

export const PageTitle = ({ title, href, align = "left", watermark }: PageTitleProps) => {
  const eyebrowText = watermark?.toUpperCase();

  return (
    <div className={clsx("page-title-wrap", align === "center" && "page-title-center")}>
      {eyebrowText ? <span className="page-title-eyebrow">{eyebrowText}</span> : null}
      <h1 className="page-title-text">
        {href ? (
          <Link href={href} className="page-title-link">
            {title}
          </Link>
        ) : (
          <span className="page-title-link">{title}</span>
        )}
      </h1>
      <span className="page-title-rule" aria-hidden="true" />
    </div>
  );
};
