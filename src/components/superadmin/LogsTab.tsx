import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileUp, LogIn, Calendar, Building2, User, Globe, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export const LogsTab = () => {
  const [selectedError, setSelectedError] = useState<string | null>(null);
  const [selectedEmailLog, setSelectedEmailLog] = useState<any | null>(null);
  // Fetch FTP upload logs
  const { data: ftpLogs, isLoading: ftpLoading } = useQuery({
    queryKey: ['ftp-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ftp_upload_logs')
        .select(`
          *,
          companies(name)
        `)
        .order('uploaded_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch access logs
  const { data: accessLogs, isLoading: accessLoading } = useQuery({
    queryKey: ['access-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_access_logs')
        .select('*')
        .order('accessed_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch email logs
  const { data: emailLogs, isLoading: emailLoading } = useQuery({
    queryKey: ['email-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*, companies(name)')
        .order('sent_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="access" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="access" className="gap-2">
            <LogIn className="h-4 w-4" />
            Accessi Piattaforma
          </TabsTrigger>
          <TabsTrigger value="ftp" className="gap-2">
            <FileUp className="h-4 w-4" />
            Caricamenti FTP
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Calendar className="h-4 w-4" />
            Invio Email
          </TabsTrigger>
        </TabsList>

        {/* Access Logs Tab */}
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Log Accessi alla Piattaforma
              </CardTitle>
              <CardDescription>
                Registro degli accessi degli utenti con IP e informazioni aziendali
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accessLoading ? (
                <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
              ) : accessLogs && accessLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Data/Ora
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Utente
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Azienda
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Indirizzo IP
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessLogs.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(log.accessed_at), "dd MMM yyyy", { locale: it })}
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(log.accessed_at), "HH:mm:ss")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{log.user_name}</TableCell>
                          <TableCell>{log.company_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {log.ip_address}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nessun accesso registrato
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FTP Logs Tab */}
        <TabsContent value="ftp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5" />
                Log Caricamenti FTP
              </CardTitle>
              <CardDescription>
                Registro dei caricamenti di documenti sul server FTP
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ftpLoading ? (
                <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
              ) : ftpLogs && ftpLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Data/Ora
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Azienda
                          </div>
                        </TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Dimensione</TableHead>
                        <TableHead>Stato</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ftpLogs.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(log.uploaded_at), "dd MMM yyyy", { locale: it })}
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(log.uploaded_at), "HH:mm:ss")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{log.companies?.name || "N/A"}</TableCell>
                          <TableCell className="font-medium max-w-xs truncate">
                            {log.file_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.file_category}</Badge>
                          </TableCell>
                          <TableCell>
                            {log.file_size 
                              ? `${(log.file_size / 1024).toFixed(1)} KB`
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {log.upload_status === "success" ? (
                              <Badge variant="default" className="bg-green-500">
                                Successo
                              </Badge>
                            ) : (
                              <Badge 
                                variant="destructive" 
                                className="cursor-pointer hover:bg-destructive/80 transition-colors"
                                onClick={() => setSelectedError(log.error_message || "Errore sconosciuto")}
                              >
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Fallito
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nessun caricamento FTP registrato
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Logs Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Log Invio Email
              </CardTitle>
              <CardDescription>
                Registro degli invii email con stato e dettagli
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emailLoading ? (
                <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
              ) : emailLogs && emailLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Data/Ora
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Azienda
                          </div>
                        </TableHead>
                        <TableHead>Destinatario</TableHead>
                        <TableHead>Oggetto</TableHead>
                        <TableHead>Template</TableHead>
                        <TableHead>Stato</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emailLogs.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="text-sm">
                              {format(new Date(log.sent_at), "dd MMM yyyy", { locale: it })}
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(log.sent_at), "HH:mm:ss")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{log.companies?.name || "N/A"}</TableCell>
                          <TableCell className="font-medium max-w-xs truncate">
                            {log.recipient_email}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {log.subject}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {log.template_type || "Manuale"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={log.status === "success" ? "default" : "destructive"}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedEmailLog(log)}
                            >
                              {log.status === "success" ? "Inviata" : "Errore"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nessun log email registrato
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Detail Dialog */}
      <Dialog open={!!selectedError} onOpenChange={() => setSelectedError(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Dettaglio Errore FTP
            </DialogTitle>
            <DialogDescription>
              Errore completo durante il caricamento del file
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-4 rounded-lg max-h-96 overflow-auto">
            <pre className="text-sm font-mono whitespace-pre-wrap break-words">{selectedError}</pre>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Log Detail Dialog */}
      <Dialog open={!!selectedEmailLog} onOpenChange={() => setSelectedEmailLog(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dettaglio Log Email
            </DialogTitle>
            <DialogDescription>
              Informazioni complete sull'invio email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Data/Ora</p>
                <p className="text-sm text-muted-foreground">
                  {selectedEmailLog && format(new Date(selectedEmailLog.sent_at), "dd MMM yyyy HH:mm:ss", { locale: it })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Stato</p>
                <Badge variant={selectedEmailLog?.status === "success" ? "default" : "destructive"}>
                  {selectedEmailLog?.status === "success" ? "Inviata con successo" : "Errore nell'invio"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Azienda</p>
                <p className="text-sm text-muted-foreground">
                  {selectedEmailLog?.companies?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Destinatario</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {selectedEmailLog?.recipient_email}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium mb-1">Oggetto</p>
                <p className="text-sm text-muted-foreground">
                  {selectedEmailLog?.subject}
                </p>
              </div>
              {selectedEmailLog?.template_type && (
                <div>
                  <p className="text-sm font-medium mb-1">Template</p>
                  <Badge variant="outline">{selectedEmailLog.template_type}</Badge>
                </div>
              )}
            </div>
            
            {selectedEmailLog?.error_message && (
              <div>
                <p className="text-sm font-medium mb-2">Messaggio di Errore</p>
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                    {selectedEmailLog.error_message}
                  </pre>
                </div>
              </div>
            )}
            
            {selectedEmailLog?.full_log && (
              <div>
                <p className="text-sm font-medium mb-2">Log Completo</p>
                <div className="bg-muted p-4 rounded-lg max-h-96 overflow-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                    {JSON.stringify(selectedEmailLog.full_log, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
