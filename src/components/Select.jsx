import { forwardRef } from 'react'

/**
 * Select — dropdown standar, styling sama seperti Input (DESIGN.md §6).
 */
const Select = forwardRef(function Select(
  { label, error, id, children, className = '', ...props },
  ref
) {
  const selectId = id || props.name
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1 block text-xs uppercase tracking-wide text-text-secondary"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 ${
          error ? 'border-red-500' : 'border-border-default'
        }`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-800">{error}</p>}
    </div>
  )
})

export default Select
