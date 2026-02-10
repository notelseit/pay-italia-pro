import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MedicalTimeline } from "./MedicalTimeline";

interface MedicalTimelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  preselectedEmployeeId?: string;
}

export function MedicalTimelineDialog({
  open,
  onOpenChange,
  companyId,
  preselectedEmployeeId,
}: MedicalTimelineDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(
    preselectedEmployeeId
  );

  useEffect(() => {
    if (preselectedEmployeeId) setSelectedEmployeeId(preselectedEmployeeId);
  }, [preselectedEmployeeId]);

  const { data: employees } = useQuery({
    queryKey: ["employees-list", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, full_name")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return data;
    },
    enabled: open && !!companyId,
  });

  const selectedName = employees?.find((e) => e.id === selectedEmployeeId)?.full_name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Timeline Sanitaria {selectedName ? `- ${selectedName}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Dipendente</Label>
            <Select value={selectedEmployeeId || ""} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona dipendente..." />
              </SelectTrigger>
              <SelectContent>
                {employees?.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEmployeeId && (
            <MedicalTimeline employeeId={selectedEmployeeId} companyId={companyId} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
