import clsx from "clsx";

const tones = {
  info: "bg-white text-ink border border-ink/10",
  warning: "bg-warningSoft text-warning border border-warning/30"
};

type AlertProps = {
  title: string;
  description: string;
  tone?: keyof typeof tones;
};

export const Alert = ({ title, description, tone = "info" }: AlertProps) => {
  return (
    <div className={clsx("rounded-xl p-4 text-sm shadow-card", tones[tone])}>
      <p className="font-semibold mb-1">{title}</p>
      <p className="tone-muted">{description}</p>
    </div>
  );
};
