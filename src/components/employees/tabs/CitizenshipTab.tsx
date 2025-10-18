import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CitizenshipTabProps {
  form: UseFormReturn<any>;
}

const maritalStatuses = [
  { value: "celibe/nubile", label: "Celibe/Nubile" },
  { value: "coniugato/a", label: "Coniugato/a" },
  { value: "divorziato/a", label: "Divorziato/a" },
  { value: "vedovo/a", label: "Vedovo/a" },
];

export const CitizenshipTab = ({ form }: CitizenshipTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nazionalità</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazionalità</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Italiana" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Carta d'Identità</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="id_card_issue_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data di Rilascio</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="id_card_expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data di Scadenza</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="id_card_municipality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comune</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Comune di rilascio" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="id_card_province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provincia</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="RM" maxLength={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Passaporto</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="passport_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero Passaporto</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="AA1234567" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passport_issue_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data di Rilascio</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passport_expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data di Scadenza</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passport_municipality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comune</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Comune di rilascio" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passport_province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Provincia</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="RM" maxLength={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Famiglia</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="marital_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stato Civile</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona stato civile" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {maritalStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dependents_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Figli a Carico</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="0"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Visa e Permesso di Soggiorno</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="visa_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N. Visto</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Numero visto" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="work_permit_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N. Permesso di Lavoro</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Numero permesso" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="police_station"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Questura</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Questura di..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visa_issue_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Rilascio</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visa_expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data Scadenza</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};