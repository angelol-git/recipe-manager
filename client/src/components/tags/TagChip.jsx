function TagChip({
  as: Component = "div",
  color,
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={`border-mantle bg-tag text-primary inline-flex min-h-8 w-fit items-center gap-2 rounded-full border px-3 py-1 text-[15px] leading-none transition-colors ${className}`.trim()}
      {...props}
    >
      {color ? (
        <div
          className="h-3.5 w-3.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      ) : null}
      {children}
    </Component>
  );
}

export default TagChip;
