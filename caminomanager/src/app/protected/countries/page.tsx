"use client";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const PAGE_SIZE = 10;

// Tipos para país y props del modal
interface Country {
  id?: number;
  name: string;
  code: string;
}

interface CountryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (country: Country) => void;
  initial?: Country | null;
}

function CountryModal({ open, onClose, onSave, initial }: CountryModalProps) {
  const [name, setName] = useState(initial?.name || "");
  const [code, setCode] = useState(initial?.code || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name || "");
      setCode(initial?.code || "");
      setError("");
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Nombre y código son requeridos");
      return;
    }
    if (code.length !== 2) {
      setError("El código debe tener 2 caracteres");
      return;
    }
    onSave({ name: name.trim(), code: code.trim().toUpperCase() });
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">{initial ? "Editar país" : "Agregar país"}</h2>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <Input value={name} onChange={e => setName(e.target.value)} required maxLength={256} />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Código</label>
          <Input value={code} onChange={e => setCode(e.target.value)} required maxLength={2} minLength={2} className="uppercase" />
        </div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="flex gap-2 justify-end mt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </div>
  );
}

export default function CountryPage() {
  const supabase = useMemo(() => createClient(), []);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Country | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ field: keyof Country; asc: boolean }>({ field: "name", asc: true });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCountries = async () => {
    setLoading(true);
    let query = supabase.from("countries").select("id, name, code", { count: "exact" });
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }
    query = query.order(sort.field, { ascending: sort.asc });
    query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    const { data, error, count } = await query;
    if (!error) {
      setCountries(data || []);
      setTotal(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCountries();
    // eslint-disable-next-line
  }, [search, sort, page]);

  const handleSave = async (country: Country) => {
    const { data, error } = await supabase.from("countries").upsert([
      editing ? { id: editing.id, name: country.name, code: country.code } : { name: country.name, code: country.code }
    ], { onConflict: "id" });
    if (!error) {
      setModalOpen(false);
      setEditing(null);
      fetchCountries();
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    if (!window.confirm("¿Seguro que deseas eliminar este país?")) return;
    await supabase.from("Countries").delete().eq("id", id);
    fetchCountries();
  };

  const handleSort = (field: keyof Country) => {
    setSort(s => ({ field, asc: s.field === field ? !s.asc : true }));
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="flex-1 w-full h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Países</CardTitle>
          <Button onClick={() => { setModalOpen(true); setEditing(null); }}>Agregar país</Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Buscar país..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="max-w-xs"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  <th className="cursor-pointer px-4 py-2 border-b" onClick={() => handleSort("name")}>Nombre {sort.field === "name" && (sort.asc ? "▲" : "▼")}</th>
                  <th className="cursor-pointer px-4 py-2 border-b" onClick={() => handleSort("code")}>Código {sort.field === "code" && (sort.asc ? "▲" : "▼")}</th>
                  <th className="px-4 py-2 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="text-center py-8">Cargando...</td></tr>
                ) : countries.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8">No hay países</td></tr>
                ) : countries.map(country => (
                  <tr key={country.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b">{country.name}</td>
                    <td className="px-4 py-2 border-b">{country.code}</td>
                    <td className="px-4 py-2 border-b flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(country); setModalOpen(true); }}>Editar</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(country.id)}>Eliminar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <span>Página {page} de {totalPages || 1}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <CountryModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
} 