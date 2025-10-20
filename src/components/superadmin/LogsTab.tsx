import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileUp, LogIn, Calendar, Building2, User, Globe } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export const LogsTab = () => {
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="access" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="access" className="gap-2">
            <LogIn className="h-4 w-4" />
            Accessi Piattaforma
          </TabsTrigger>
          <TabsTrigger value="ftp" className="gap-2">
            <FileUp className="h-4 w-4" />
            Caricamenti FTP
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
                              <Badge variant="destructive">
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
      </Tabs>
    </div>
  );
};
