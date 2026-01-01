import clsx from "clsx";

type TableProps = {
  children: React.ReactNode;
  className?: string;
};

export const Table = ({ children, className }: TableProps) => {
  return <table className={clsx("table-base", className)}>{children}</table>;
};
