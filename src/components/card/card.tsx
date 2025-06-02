export const Card: React.FC<{
  className?: string;
  children: React.ReactNode;
  onclick?: () => void;
}> = ({className = "", children, onclick}) => {
  return (
    <div
      className={`rounded-md border border-border bg-white shadow-sm ${className}`}
      onClick={onclick}
    >
      {children}
    </div>
  );
};

// CardContent Component
export const CardContent: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({className = "", children}) => {
  return <div className={`px-4 py-3 ${className}`}>{children}</div>;
};
