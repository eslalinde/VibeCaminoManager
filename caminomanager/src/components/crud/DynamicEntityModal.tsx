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
import { X } from "lucide-react";
import {
  useCountryOptions,
  useStateOptions,
  useCityOptions,
  useAllCityOptions,
  useZoneOptions,
  useDioceseOptions,
  useParishOptions,
  useAllParishOptions,
  usePeopleOptions,
  useCathechistTeamOptions,
  useEntityOptions,
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
  const [formKey, setFormKey] = useState(0); // Key para forzar re-render
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isInitialized = useRef(false);
  const previousValues = useRef<Record<string, any>>({});

  // Hooks para opciones dependientes
  const { options: countryOptions, loading: countryLoading, error: countryError } = useCountryOptions();
  const { options: stateOptions } = useStateOptions(formData.country_id);
  
  // Determinar si el formulario tiene campos de país y departamento
  const hasCountryField = fields.some(f => f.name === 'country_id');
  const hasStateField = fields.some(f => f.name === 'state_id');
  const hasCityField = fields.some(f => f.name === 'city_id');
  
  // Usar el hook apropiado para ciudades
  const { options: cityOptions } = hasCountryField || hasStateField
    ? useCityOptions(formData.country_id, formData.state_id)
    : useAllCityOptions();

  // Zonas filtradas por ciudad
  const { options: zoneOptions } = useZoneOptions(formData.city_id ? Number(formData.city_id) : undefined);

  // Diócesis
  const { options: dioceseOptions } = useDioceseOptions();

  // Usar el hook apropiado para parroquias
  const { options: parishOptions } = hasCityField
    ? useParishOptions(formData.city_id)
    : useAllParishOptions();
  const { options: peopleOptions, loading: peopleLoading } = usePeopleOptions(initial?.id);
  const { options: stepWayOptions } = useEntityOptions({
    tableName: 'step_ways',
    orderBy: { field: 'order_num', asc: true }
  });
  const { options: cathechistTeamOptions } = useCathechistTeamOptions();

  useEffect(() => {
    if (open) {
      const initialData: Record<string, any> = {};
      fields.forEach((field) => {
        const rawValue = initial?.[field.name as keyof T];
        let value: any = rawValue;
        
        // Handle different field types properly
        if (field.type === 'select') {
          // For select fields, convert to string or empty string
          value = rawValue !== null && rawValue !== undefined ? String(rawValue) : "";
        } else {
          // For other fields, use the raw value or empty string
          value = rawValue || "";
        }
        
        initialData[field.name] = value;
        previousValues.current[field.name] = value;
        
        // Debug logging for person fields
        if (field.name === 'person_type_id' || field.name === 'gender_id') {
          console.log(`🔍 Person field ${field.name}:`, {
            rawValue,
            processedValue: value,
            fieldType: field.type,
            hasOptions: field.options && field.options.length > 0,
            options: field.options
          });
        }
      });
      
      setFormData(initialData);
      setErrors({});
      setFormKey(prev => prev + 1); // Force re-render
      isInitialized.current = true;
    } else {
      // Reset when modal closes
      isInitialized.current = false;
      previousValues.current = {};
    }
  }, [open, initial, fields]);

  // Re-sincronizar spouse_id cuando se carguen las opciones de personas
  useEffect(() => {
    if (!isInitialized.current || !open || peopleLoading) return;
    
    // Si las opciones de personas se cargaron y tenemos un spouse_id, asegurar que esté sincronizado
    if (peopleOptions && peopleOptions.length > 0 && (initial as any)?.spouse_id) {
      const currentSpouseValue = formData.spouse_id;
      const expectedSpouseValue = String((initial as any).spouse_id);
      
      if (currentSpouseValue !== expectedSpouseValue) {
        console.log('🔄 Re-syncing spouse_id after options loaded:', {
          currentSpouseValue,
          expectedSpouseValue,
          peopleOptions: peopleOptions.length
        });
        setFormData(prev => ({ ...prev, spouse_id: expectedSpouseValue }));
      }
    }
  }, [peopleOptions, peopleLoading, (initial as any)?.spouse_id, formData.spouse_id, isInitialized.current, open]);

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

    // Check if city_id changed from its previous value
    if (formData.city_id !== previousValues.current.city_id) {
      // Limpiar zona cuando cambia la ciudad
      if (fields.some(f => f.name === 'zone_id')) {
        setFormData((prev) => ({ ...prev, zone_id: "" }));
      }
      // Update the previous value
      previousValues.current.city_id = formData.city_id;
    }
  }, [formData.country_id, formData.state_id, formData.city_id, fields]);

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
      const val = preparedData[field.name];
      const isEmpty = val === '' || val === null || val === undefined;

      if (field.name.includes('_id')) {
        preparedData[field.name] = isEmpty ? null : parseInt(val, 10);
      } else if (field.type === 'number') {
        preparedData[field.name] = isEmpty ? null : Number(val);
      } else if (field.type === 'date') {
        preparedData[field.name] = isEmpty ? null : val;
      }
    });

    console.log('Prepared data:', preparedData);

    try {
      await onSave(preparedData as Omit<T, "id" | "created_at" | "updated_at">);
    } catch (error: any) {
      console.error("Error saving entity:", error);
      alert(error?.message || 'Error al guardar. Por favor, intenta de nuevo.');
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [fieldName]: value };
      
      // Si se cambia el person_type_id y no es "Casado" (valor 1), limpiar spouse_id
      if (fieldName === 'person_type_id') {
        const isMarried = value === '1' || value === 1;
        if (!isMarried) {
          newData.spouse_id = null; // Limpiar el cónyuge si no está casado
        }
      }
      
      return newData;
    });

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
      console.log(`✅ Field ${fieldName} using config options:`, fieldConfig.options);
      return fieldConfig.options;
    }
    
    switch (fieldName) {
      case "country_id":
        return countryOptions && countryOptions.length > 0 ? countryOptions : [];
      case "state_id":
        return stateOptions && stateOptions.length > 0 ? stateOptions : [];
      case "city_id":
        return cityOptions && cityOptions.length > 0 ? cityOptions : [];
      case "zone_id":
        return zoneOptions && zoneOptions.length > 0 ? zoneOptions : [];
      case "diocese_id":
        return dioceseOptions && dioceseOptions.length > 0 ? dioceseOptions : [];
      case "parish_id":
        return parishOptions && parishOptions.length > 0 ? parishOptions : [];
      case "spouse_id":
        return peopleOptions && peopleOptions.length > 0 ? peopleOptions : [];
      case "step_way_id":
        return stepWayOptions && stepWayOptions.length > 0 ? stepWayOptions : [];
      case "cathechist_team_id":
        return cathechistTeamOptions && cathechistTeamOptions.length > 0 ? cathechistTeamOptions : [];
      default:
        console.log(`❌ Field ${fieldName} has no options`);
        return fieldName.includes("_id") ? [] : undefined;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
        <h2 className="text-xl font-bold mb-5 pr-8">{title}</h2>

        <FormRoot key={formKey} onSubmit={handleSubmit}>
          {fields.map((field) => {
            const fieldOptions = getFieldOptions(field.name);
            
            // Debug logging for person fields
            if (field.name === 'person_type_id' || field.name === 'gender_id') {
              console.log(`🎯 Rendering person field ${field.name}:`, {
                formDataValue: formData[field.name],
                fieldOptions: fieldOptions,
                hasOptions: fieldOptions && fieldOptions.length > 0,
                configOptions: field.options
              });
            }

            // Solo mostrar zone_id si la ciudad seleccionada tiene zonas
            if (field.name === 'zone_id') {
              if (!zoneOptions || zoneOptions.length === 0) {
                return null;
              }
            }

            // Lógica condicional para mostrar/ocultar el campo cónyuge
            // Solo mostrar spouse_id si person_type_id es 1 (Casado)
            if (field.name === 'spouse_id') {
              const isMarried = formData.person_type_id === '1' || formData.person_type_id === 1;
              if (!isMarried) {
                return null; // No renderizar el campo si no está casado
              }
            }

            return (
              <FormField key={field.name} name={field.name}>
                <FormLabel>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </FormLabel>
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
                      value={formData[field.name] !== null && formData[field.name] !== undefined ? String(formData[field.name]) : ""}
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
                            value={String(option.value)}
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
                      className={
                        field.name === "code" 
                          ? "uppercase" 
                          : field.type === "date"
                          ? "date-input"
                          : ""
                      }
                    />
                  )}
                </FormControl>
                {errors[field.name] && (
                  <FormMessage>{errors[field.name]}</FormMessage>
                )}
              </FormField>
            );
          })}

          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="2"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <FormSubmit asChild>
              <Button type="submit" size="2" color="amber" highContrast disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </FormSubmit>
          </div>
        </FormRoot>
      </div>
    </div>
  );
}
