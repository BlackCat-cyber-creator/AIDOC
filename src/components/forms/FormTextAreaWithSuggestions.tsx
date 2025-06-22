import * as React from 'react';
import { useController, UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { X as XIcon } from 'lucide-react';

interface SuggestionItem {
  value: string;
  label: string;
}

interface FormTextAreaWithSuggestionsProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder: string;
  suggestions: string[];
  description?: string;
  required?: boolean;
}

export function FormTextAreaWithSuggestions<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  suggestions,
  description,
  required = false,
}: FormTextAreaWithSuggestionsProps<TFieldValues>) {
  const { field, fieldState } = useController({
    name,
    control: form.control,
  });

  const hasError = !!fieldState.error;
  const isValid = fieldState.isTouched && !hasError;

  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(
    Array.isArray(field.value) ? field.value.join('\n') : typeof field.value === 'string' ? field.value : ''
  );

  const filteredSuggestions = React.useMemo(() => {
    const currentLine = inputValue.split('\n').pop()?.toLowerCase() || '';
    const existingValues = new Set((Array.isArray(field.value) ? field.value : []).map((v: string) => v.toLowerCase()));
    return suggestions.filter(
      (suggestion) => suggestion.toLowerCase().includes(currentLine) && !existingValues.has(suggestion.toLowerCase())
    );
  }, [inputValue, suggestions, field.value]);

  React.useEffect(() => {
    const currentFieldValue = Array.isArray(field.value)
      ? field.value.join('\n')
      : typeof field.value === 'string'
        ? field.value
        : '';
    if (currentFieldValue !== inputValue) {
      setInputValue(currentFieldValue);
    }
  }, [field.value, inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    field.onChange(e.target.value); // Pass the string value directly
    setPopoverOpen(true); // Open popover on input change
  };

  const handleSelectSuggestion = (suggestion: string) => {
    const lines = inputValue.split('\n');
    lines[lines.length - 1] = suggestion; // Replace last line with suggestion
    const newValue = lines.join('\n');
    setInputValue(newValue);
    field.onChange(newValue); // Pass the new string value directly
    setPopoverOpen(false);
  };

  return (
    <FormItem>
      <FormLabel>
        {label} {required && <span className="text-destructive">*</span>}
      </FormLabel>
      <FormControl>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Textarea
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                className={cn(
                  hasError && 'border-destructive focus-visible:ring-destructive',
                  isValid && 'border-primary focus-visible:ring-primary'
                )}
              />
              {hasError && <XIcon className="absolute right-3 top-3 h-4 w-4 text-destructive" />}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput
                placeholder={`Search ${label.toLowerCase()}...`}
                className="h-9"
                value={inputValue.split('\n').pop() || ''}
                onValueChange={(value) => {
                  const lines = inputValue.split('\n');
                  lines[lines.length - 1] = value;
                  const newValue = lines.join('\n');
                  setInputValue(newValue);
                  field.onChange(newValue); // Pass the new string value directly
                }}
              />
              <ScrollArea className="h-[200px]">
                <CommandList>
                  <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                  <CommandGroup>
                    {filteredSuggestions.map((suggestion) => (
                      <CommandItem
                        key={suggestion}
                        value={suggestion}
                        onSelect={() => handleSelectSuggestion(suggestion)}
                      >
                        {suggestion}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </ScrollArea>
            </Command>
          </PopoverContent>
        </Popover>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
