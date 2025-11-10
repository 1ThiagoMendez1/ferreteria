import React from "react";

type PageHeaderProps = {
  title: string;
  actions?: React.ReactNode;
};

export default function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold font-headline">{title}</h1>
      {actions && <div>{actions}</div>}
    </div>
  );
}
