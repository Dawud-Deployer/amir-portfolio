'use client';

type FormFieldProps = {
  label?: string;
  id?: string;
  required?: boolean;
  error?: string;
  help?: string;
  children: React.ReactNode;
};

export function FormField({ label, id, required, error, help, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id ?? undefined} className="text-xs font-semibold uppercase tracking-eyebrow text-foreground">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  help?: string;
};

export function TextInput({ label, error, help, className, ...props }: TextInputProps) {
  return (
    <FormField label={label} id={props.id} required={props.required} error={error} help={help}>
      <input
        {...props}
        className={`w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all ${className || ''}`}
      />
    </FormField>
  );
}

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  help?: string;
};

export function TextArea({ label, error, help, className, ...props }: TextAreaProps) {
  return (
    <FormField label={label} id={props.id} required={props.required} error={error} help={help}>
      <textarea
        {...props}
        className={`w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none ${className || ''}`}
      />
    </FormField>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  help?: string;
  options: { value: string; label: string }[];
};

export function Select({ label, error, help, options, className, ...props }: SelectProps) {
  return (
    <FormField label={label} id={props.id} required={props.required} error={error} help={help}>
      <select
        {...props}
        className={`w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all ${className || ''}`}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        {...props}
        className={`w-4 h-4 rounded border-border cursor-pointer accent-primary ${className || ''}`}
      />
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
    </label>
  );
}
