import React from "react";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <div className={`chart-card ${className}`}>
      <div className="chart-card-header">
        <h3 className="chart-card-title">{title}</h3>
      </div>
      <div className="chart-card-content">{children}</div>
    </div>
  );
};

export default ChartCard;
