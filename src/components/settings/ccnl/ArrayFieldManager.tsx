import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ArrayFieldManagerProps {
  label: string;
  fields: { name: string; label: string; type?: string; step?: string }[];
  value: any[];
  onChange: (value: any[]) => void;
}

export const ArrayFieldManager = ({ label, fields, value, onChange }: ArrayFieldManagerProps) => {
  const [items, setItems] = useState<any[]>(value || []);

  const addItem = () => {
    const newItem: any = {};
    fields.forEach(field => {
      newItem[field.name] = field.type === "number" ? 0 : "";
    });
    const updated = [...items, newItem];
    setItems(updated);
    onChange(updated);
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onChange(updated);
  };

  const updateItem = (index: number, fieldName: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [fieldName]: value };
    setItems(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-1" />
          Aggiungi
        </Button>
      </div>
      
      <div className="space-y-2">
        {items.map((item, index) => (
          <Card key={index} className="p-3">
            <div className="flex gap-2 items-end">
              {fields.map((field) => (
                <div key={field.name} className="flex-1 space-y-1">
                  <Label className="text-xs">{field.label}</Label>
                  <Input
                    type={field.type || "text"}
                    step={field.step}
                    value={item[field.name] || ""}
                    onChange={(e) => updateItem(index, field.name, field.type === "number" ? parseFloat(e.target.value) : e.target.value)}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </Card>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Nessuna voce aggiunta</p>
        )}
      </div>
    </div>
  );
};
