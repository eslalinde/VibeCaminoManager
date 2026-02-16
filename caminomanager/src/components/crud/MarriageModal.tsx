import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { usePeopleOptions } from "@/hooks/useEntityOptions";
import { createClient } from "@/utils/supabase/client";

interface MarriageModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (husbandId?: number, wifeId?: number) => void;
}

interface MarriageFormData {
  husband_name: string;
  husband_phone: string;
  husband_mobile: string;
  husband_email: string;
  wife_name: string;
  wife_phone: string;
  wife_mobile: string;
  wife_email: string;
}

export function MarriageModal({ open, onClose, onSuccess }: MarriageModalProps) {
  const [formData, setFormData] = useState<MarriageFormData>({
    husband_name: '',
    husband_phone: '',
    husband_mobile: '',
    husband_email: '',
    wife_name: '',
    wife_phone: '',
    wife_mobile: '',
    wife_email: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      setFormData({
        husband_name: '',
        husband_phone: '',
        husband_mobile: '',
        husband_email: '',
        wife_name: '',
        wife_phone: '',
        wife_mobile: '',
        wife_email: ''
      });
      setErrors({});
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate husband fields
    if (!formData.husband_name.trim()) {
      newErrors.husband_name = 'El nombre del esposo es requerido';
      isValid = false;
    }

    if (!formData.wife_name.trim()) {
      newErrors.wife_name = 'El nombre de la esposa es requerido';
      isValid = false;
    }

    // Validate email formats if provided
    if (formData.husband_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.husband_email)) {
      newErrors.husband_email = 'Formato de email inválido';
      isValid = false;
    }

    if (formData.wife_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.wife_email)) {
      newErrors.wife_email = 'Formato de email inválido';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Create husband
      const { data: husband, error: husbandError } = await supabase
        .from('people')
        .insert({
          person_name: formData.husband_name,
          phone: formData.husband_phone || null,
          mobile: formData.husband_mobile || null,
          email: formData.husband_email || null,
          person_type_id: 1, // Casado
          gender_id: 1, // Masculino
        })
        .select()
        .single();

      if (husbandError) throw husbandError;

      // Create wife
      const { data: wife, error: wifeError } = await supabase
        .from('people')
        .insert({
          person_name: formData.wife_name,
          phone: formData.wife_phone || null,
          mobile: formData.wife_mobile || null,
          email: formData.wife_email || null,
          person_type_id: 1, // Casado
          gender_id: 2, // Femenino
          spouse_id: husband.id,
        })
        .select()
        .single();

      if (wifeError) throw wifeError;

      // Update husband with wife's ID
      const { error: updateError } = await supabase
        .from('people')
        .update({ spouse_id: wife.id })
        .eq('id', husband.id);

      if (updateError) throw updateError;

      onSuccess(husband.id, wife.id);
      onClose();
    } catch (error: any) {
      console.error('Error creating marriage:', error);
      setErrors({ general: error.message || 'Error al crear el matrimonio' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: keyof MarriageFormData, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-lg font-bold mb-4">Crear Matrimonio</h2>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <FormRoot onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Husband Section */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-blue-600">Esposo</h3>
              
              <FormField name="husband_name">
                <FormLabel>Nombre del Esposo *</FormLabel>
                <FormControl asChild>
                  <Input
                    value={formData.husband_name}
                    onChange={(e) => handleInputChange('husband_name', e.target.value)}
                    placeholder="Ingrese el nombre del esposo"
                    disabled={loading}
                  />
                </FormControl>
                {errors.husband_name && (
                  <FormMessage>{errors.husband_name}</FormMessage>
                )}
              </FormField>

              <FormField name="husband_phone">
                <FormLabel>Teléfono</FormLabel>
                <FormControl asChild>
                  <Input
                    value={formData.husband_phone}
                    onChange={(e) => handleInputChange('husband_phone', e.target.value)}
                    placeholder="Ingrese el teléfono"
                    disabled={loading}
                  />
                </FormControl>
              </FormField>

              <FormField name="husband_mobile">
                <FormLabel>Celular</FormLabel>
                <FormControl asChild>
                  <Input
                    value={formData.husband_mobile}
                    onChange={(e) => handleInputChange('husband_mobile', e.target.value)}
                    placeholder="Ingrese el celular"
                    disabled={loading}
                  />
                </FormControl>
              </FormField>

              <FormField name="husband_email">
                <FormLabel>Email</FormLabel>
                <FormControl asChild>
                  <Input
                    type="email"
                    value={formData.husband_email}
                    onChange={(e) => handleInputChange('husband_email', e.target.value)}
                    placeholder="Ingrese el email"
                    disabled={loading}
                  />
                </FormControl>
                {errors.husband_email && (
                  <FormMessage>{errors.husband_email}</FormMessage>
                )}
              </FormField>
            </div>

            {/* Wife Section */}
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-pink-600">Esposa</h3>
              
              <FormField name="wife_name">
                <FormLabel>Nombre de la Esposa *</FormLabel>
                <FormControl asChild>
                  <Input
                    value={formData.wife_name}
                    onChange={(e) => handleInputChange('wife_name', e.target.value)}
                    placeholder="Ingrese el nombre de la esposa"
                    disabled={loading}
                  />
                </FormControl>
                {errors.wife_name && (
                  <FormMessage>{errors.wife_name}</FormMessage>
                )}
              </FormField>

              <FormField name="wife_phone">
                <FormLabel>Teléfono</FormLabel>
                <FormControl asChild>
                  <Input
                    value={formData.wife_phone}
                    onChange={(e) => handleInputChange('wife_phone', e.target.value)}
                    placeholder="Ingrese el teléfono"
                    disabled={loading}
                  />
                </FormControl>
              </FormField>

              <FormField name="wife_mobile">
                <FormLabel>Celular</FormLabel>
                <FormControl asChild>
                  <Input
                    value={formData.wife_mobile}
                    onChange={(e) => handleInputChange('wife_mobile', e.target.value)}
                    placeholder="Ingrese el celular"
                    disabled={loading}
                  />
                </FormControl>
              </FormField>

              <FormField name="wife_email">
                <FormLabel>Email</FormLabel>
                <FormControl asChild>
                  <Input
                    type="email"
                    value={formData.wife_email}
                    onChange={(e) => handleInputChange('wife_email', e.target.value)}
                    placeholder="Ingrese el email"
                    disabled={loading}
                  />
                </FormControl>
                {errors.wife_email && (
                  <FormMessage>{errors.wife_email}</FormMessage>
                )}
              </FormField>
            </div>
          </div>

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
                {loading ? "Creando..." : "Crear Matrimonio"}
              </Button>
            </FormSubmit>
          </div>
        </FormRoot>
      </div>
    </div>
  );
}
