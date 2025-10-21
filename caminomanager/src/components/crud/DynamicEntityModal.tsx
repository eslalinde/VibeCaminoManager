import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormRoot,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
  FormSubmit,
} from "@/components/ui/form";
import { BaseEntity, FormField as FormFieldType } from "@/types/database";
import {
  useCountryOptions,
  useStateOptions,
  useCityOptions,
  useAllCityOptions,
  useParishOptions,
  usePeopleOptions,
} from "@/hooks/useEntityOptions";

interface DynamicEntityModalProps<T extends BaseEntity> {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<T, "id" | "created_at" | "updated_at">) => Promise<void>;
  initial?: T | null;
  fields: FormFieldType[];
  title: string;
  loading?: boolean;
}

export function DynamicEntityModal<T extends BaseEntity>({
  open,
  onClose,
  onSave,
  initial,
  fields,
  title,
  loading = false,
}: DynamicEntityModalProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isInitialized = useRef(false);
  const previousValues = useRef<Record<string, any>>({});

  // Hooks para opciones dependientes
  const { options: countryOptions, loading: countryLoading, error: countryError } = useCountryOptions();
  const { options: stateOptions } = useStateOptions(formData.country_id);
  
  // Determinar si el formulario tiene campos de país y departamento
  const hasCountryField = fields.some(f => f.name === 'country_id');
  const hasStateField = fields.some(f => f.name === 'state_id');
  
  // Usar el hook apropiado para ciudades
  const { options: cityOptions } = hasCountryField || hasStateField 
    ? useCityOptions(formData.country_id, formData.state_id)
    : useAllCityOptions();
    
  const { options: parishOptions } = useParishOptions(formData.city_id);
  const { options: peopleOptions } = usePeopleOptions(initial?.id);

  // Debug logging para países
  useEffect(() => {
    if (hasCountryField) {
      console.log('DynamicEntityModal - Country options:', {
        countryOptions,
        countryLoading,
        countryError,
        hasCountryField
      });
    }
  }, [countryOptions, countryLoading, countryError, hasCountryField]);

  useEffect(() => {
    if (open) {
      const initialData: Record<string, any> = {};
      // Solo inicializar los campos que están definidos en la configuración
      fields.forEach((field) => {
        const value = initial?.[field.name as keyof T] || "";
        initialData[field.name] = value;
        // Store initial values for comparison
        previousValues.current[field.name] = value;
      });
      setFormData(initialData);
      setErrors({});
      isInitialized.current = true;
    } else {
      // Reset when modal closes
      isInitialized.current = false;
      previousValues.current = {};
    }
  }, [open, initial, fields]);

  // Limpiar campos dependientes cuando cambia el padre (solo después de la inicialización)
  useEffect(() => {
    if (!isInitialized.current) return;

    // Check if country_id changed from its previous value
    if (formData.country_id !== previousValues.current.country_id) {
      // Solo limpiar campos que están definidos en la configuración
      if (fields.some(f => f.name === 'state_id')) {
        setFormData((prev) => ({ ...prev, state_id: "" }));
      }
      if (fields.some(f => f.name === 'city_id')) {
        setFormData((prev) => ({ ...prev, city_id: "" }));
      }
      // Update the previous value
      previousValues.current.country_id = formData.country_id;
    }
    
    // Check if state_id changed from its previous value
    if (formData.state_id !== previousValues.current.state_id) {
      // Solo limpiar campos que están definidos en la configuración
      if (fields.some(f => f.name === 'city_id')) {
        setFormData((prev) => ({ ...prev, city_id: "" }));
      }
      // Update the previous value
      previousValues.current.state_id = formData.state_id;
    }
  }, [formData.country_id, formData.state_id, fields]);

  const validateField = (field: FormFieldType, value: any): string | null => {
    // Validación para campos requeridos
    if (field.required) {
      if (!value || value.toString().trim() === "") {
        return `${field.label} es requerido`;
      }
    }

    // Validación para campos de ID que deben ser números válidos
    if (field.name.includes('_id') && field.type === 'select' && value) {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue <= 0) {
        return `${field.label} debe ser un ID válido`;
      }
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

    fields.forEach((field) => {
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

    // Log para debugging
    console.log('Submitting form data:', formData);
    console.log('Fields configuration:', fields);

    // Preparar datos con tipos correctos
    const preparedData = { ...formData };
    fields.forEach(field => {
      if (field.name.includes('_id')) {
        if (preparedData[field.name] === '' || preparedData[field.name] === null || preparedData[field.name] === undefined) {
          // For optional fields, convert empty values to null
          // For required fields, this will be caught by validation
          preparedData[field.name] = null;
        } else {
          // Convert valid IDs to numbers
          preparedData[field.name] = parseInt(preparedData[field.name], 10);
        }
      }
    });

    console.log('Prepared data:', preparedData);

    try {
      await onSave(preparedData as Omit<T, "id" | "created_at" | "updated_at">);
    } catch (error) {
      console.error("Error saving entity:", error);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const getFieldOptions = (fieldName: string) => {
    // Solo devolver opciones para campos que están definidos en la configuración
    if (!fields.some(f => f.name === fieldName)) {
      return undefined;
    }
    
    // Buscar el campo en la configuración para obtener sus opciones
    const fieldConfig = fields.find(f => f.name === fieldName);
    if (fieldConfig && fieldConfig.options && fieldConfig.options.length > 0) {
      return fieldConfig.options;
    }
    
    switch (fieldName) {
      case "country_id":
        return countryOptions && countryOptions.length > 0 ? countryOptions : [];
      case "state_id":
        return stateOptions && stateOptions.length > 0 ? stateOptions : [];
      case "city_id":
        return cityOptions && cityOptions.length > 0 ? cityOptions : [];
      case "parish_id":
        return parishOptions && parishOptions.length > 0 ? parishOptions : [];
      case "spouse_id":
        return peopleOptions && peopleOptions.length > 0 ? peopleOptions : [];
      default:
        return fieldName.includes("_id") ? [] : undefined;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-lg font-bold mb-4">{title}</h2>

        <FormRoot onSubmit={handleSubmit}>
          {fields.map((field) => {
            const fieldOptions = getFieldOptions(field.name);

            return (
              <FormField key={field.name} name={field.name}>
                <FormLabel>{field.label}</FormLabel>
                <FormControl asChild className="w-full">
                  {field.type === "textarea" ? (
                    <Textarea
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      required={field.required}
                      maxLength={field.maxLength}
                      minLength={field.minLength}
                      placeholder={field.placeholder}
                      disabled={loading}
                      rows={3}
                    />
                  ) : field.type === "select" ? (
                    <Select
                      value={formData[field.name] ? formData[field.name].toString() : ""}
                      onValueChange={(value: string) =>
                        handleInputChange(field.name, value)
                      }
                      disabled={loading}
                    >
                      <SelectTrigger
                        placeholder={field.placeholder || "Seleccionar..."}
                      />
                      <SelectContent>
                        {(fieldOptions || field.options || []).map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value.toString()}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={field.type}
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      required={field.required}
                      maxLength={field.maxLength}
                      minLength={field.minLength}
                      placeholder={field.placeholder}
                      disabled={loading}
                      className={field.name === "code" ? "uppercase" : ""}
                    />
                  )}
                </FormControl>
                {errors[field.name] && (
                  <FormMessage>{errors[field.name]}</FormMessage>
                )}
              </FormField>
            );
          })}

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
