import * as React from 'react';
import { useController, Control, FieldValues, FieldPath } from 'react-hook-form';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { X as XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FormTextAreaWithSuggestionsProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder: string;
  suggestions: string[];
  description?: string;
  required?: boolean;
}

export function FormTextAreaWithSuggestions<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  suggestions,
  description,
  required = false,
}: FormTextAreaWithSuggestionsProps<TFieldValues>) {
  const { t } = useTranslation();
  const { field, fieldState } = useController({
    name,
    control,
  });

  const hasError = !!fieldState.error;
  const isValid = fieldState.isTouched && !hasError;

  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(field.value?.toString() || '');

  const filteredSuggestions = React.useMemo(() => {
    const currentLine = inputValue.split('\n').pop()?.toLowerCase() || '';
    if (!currentLine.trim()) return [];

    return suggestions.filter((suggestion) => suggestion.toLowerCase().includes(currentLine));
  }, [inputValue, suggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    field.onChange(value);
    setPopoverOpen(true);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    const lines = inputValue.split('\n');
    lines[lines.length - 1] = suggestion;
    const newValue = lines.join('\n') + '\n';
    setInputValue(newValue);
    field.onChange(newValue);
    setPopoverOpen(false);
  };

  return (
    <FormItem>
      <FormLabel>
        {label} {required && <span className="text-destructive">*</span>}
      </FormLabel>
      <FormControl>
        <Popover open={popoverOpen && filteredSuggestions.length > 0} onOpenChange={setPopoverOpen}>
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
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command shouldFilter={false}>
              <ScrollArea className="h-[200px]">
                <CommandList>
                  {filteredSuggestions.length > 0 ? (
                    <CommandGroup>
                      {filteredSuggestions.map((item) => (
                        <CommandItem key={item} value={item} onSelect={() => handleSelectSuggestion(item)}>
                          {item}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ) : (
                    <CommandEmpty>{t('none')}</CommandEmpty>
                  )}
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
