import { forwardRef } from 'react'

/**
 * Input — rounded-lg, focus violet (primary-600) + ring halus.
 */
const Input = forwardRef(function Input({ label, error, id, className = '', ...props }, ref) {
  const inputId = id || props.name
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-xs uppercase tracking-wide text-text-secondary"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 ${
          error ? 'border-red-500' : 'border-border-default'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-800">{error}</p>}
    </div>
  )
})

export default Input
