import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, Mail, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Employees = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock employee data
  const employees = [
    {
      id: 1,
      name: "Mario Rossi",
      email: "mario.rossi@email.it",
      phone: "+39 333 1234567",
      taxCode: "RSSMRA80A01H501U",
      contractType: "Tempo Indeterminato",
      salary: "€2,500",
      status: "Attivo"
    },
    {
      id: 2,
      name: "Laura Bianchi",
      email: "laura.bianchi@email.it",
      phone: "+39 333 2345678",
      taxCode: "BNCLRA85B42F205W",
      contractType: "Tempo Determinato",
      salary: "€2,200",
      status: "Attivo"
    },
    {
      id: 3,
      name: "Giuseppe Verdi",
      email: "giuseppe.verdi@email.it",
      phone: "+39 333 3456789",
      taxCode: "VRDGPP75C15L219X",
      contractType: "Tempo Indeterminato",
      salary: "€3,000",
      status: "Attivo"
    },
    {
      id: 4,
      name: "Anna Neri",
      email: "anna.neri@email.it",
      phone: "+39 333 4567890",
      taxCode: "NRANNA90D50A794Y",
      contractType: "Part-time",
      salary: "€1,500",
      status: "Attivo"
    },
  ];

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.taxCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Gestione Dipendenti</h1>
          <p className="text-muted-foreground">Anagrafica e informazioni dei dipendenti</p>
        </div>

        {/* Actions Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per nome o codice fiscale..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="hero">
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi Dipendente
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employee Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Totale Dipendenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">142</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tempo Indeterminato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">108</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Nuovi questo mese
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">+8</div>
            </CardContent>
          </Card>
        </div>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>Elenco Dipendenti</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Codice Fiscale</TableHead>
                  <TableHead>Contatti</TableHead>
                  <TableHead>Contratto</TableHead>
                  <TableHead>Retribuzione</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell className="font-mono text-sm">{employee.taxCode}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {employee.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.contractType}</TableCell>
                    <TableCell className="font-semibold">{employee.salary}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Employees;
