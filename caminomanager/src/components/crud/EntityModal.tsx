import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormRoot, FormField, FormLabel, FormControl, FormMessage, FormSubmit } from '@/components/ui/form';
import { BaseEntity, FormField as FormFieldType } from '@/types/database';

interface EntityModalProps<T extends BaseEntity> {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initial?: T | null;
  fields: FormFieldType[];
  title: string;
  loading?: boolean;
}

export function EntityModal<T extends BaseEntity>({
  open,
  onClose,
  onSave,
  initial,
  fields,
  title,
  loading = false
}: EntityModalProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      const initialData: Record<string, any> = {};
      fields.forEach(field => {
        initialData[field.name] = initial?.[field.name as keyof T] || '';
      });
      setFormData(initialData);
      setErrors({});
    }
  }, [open, initial, fields]);

  const validateField = (field: FormFieldType, value: any): string | null => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} es requerido`;
    }

    if (field.minLength && value && value.toString().length < field.minLength) {
      return `${field.label} debe tener al menos ${field.minLength} caracteres`;
    }

    if (field.maxLength && value && value.toString().length > field.maxLength) {
      return `${field.label} debe tener máximo ${field.maxLength} caracteres`;
    }

    if (field.validation) {
      return field.validation(value);
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const value = formData[field.name];
      const error = validateField(field, value);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData as Omit<T, 'id' | 'created_at' | 'updated_at'>);
    } catch (error) {
      console.error('Error saving entity:', error);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        
        <FormRoot onSubmit={handleSubmit}>
          {fields.map(field => (
                         <FormField key={field.name} name={field.name}>
               <FormLabel>{field.label}</FormLabel>
               <FormControl asChild className="w-full">
                {field.type === 'textarea' ? (
                  <Textarea
                    value={formData[field.name] || ''}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    maxLength={field.maxLength}
                    minLength={field.minLength}
                    placeholder={field.placeholder}
                    disabled={loading}
                    rows={3}
                  />
                ) : field.type === 'select' ? (
                  <Select
                    value={formData[field.name] || ''}
                    onValueChange={(value: string) => handleInputChange(field.name, value)}
                    disabled={loading}
                  >
                    <SelectTrigger placeholder={field.placeholder || "Seleccionar..."} />
                    <SelectContent>
                      {field.options?.map(option => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={e => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    maxLength={field.maxLength}
                    minLength={field.minLength}
                    placeholder={field.placeholder}
                    disabled={loading}
                    className={field.name === 'code' ? 'uppercase' : ''}
                  />
                )}
              </FormControl>
              {errors[field.name] && (
                <FormMessage>{errors[field.name]}</FormMessage>
              )}
            </FormField>
          ))}
          
          <div className="flex gap-2 justify-end mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
            >
              Cancelar
            </Button>
            <FormSubmit asChild>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </FormSubmit>
          </div>
        </FormRoot>
      </div>
    </div>
  );
} 