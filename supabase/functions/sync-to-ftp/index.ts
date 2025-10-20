import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  basePath: string;
}

class FTPClient {
  private config: FTPConfig;
  private conn: Deno.Conn | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;

  constructor(config: FTPConfig) {
    this.config = config;
  }

  private async readResponse(): Promise<string> {
    const decoder = new TextDecoder();
    let response = "";
    const timeout = setTimeout(() => {
      throw new Error("FTP read timeout");
    }, 10000);

    try {
      while (true) {
        const { value, done } = await this.reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        response += chunk;

        if (response.includes("\n")) {
          break;
        }
      }
    } finally {
      clearTimeout(timeout);
    }

    console.log("FTP Response:", response.trim());
    return response;
  }

  private async sendCommand(command: string): Promise<string> {
    const encoder = new TextEncoder();
    await this.writer!.write(encoder.encode(command + "\r\n"));
    console.log("FTP Command:", command.replace(/PASS .+/, "PASS ****"));
    return await this.readResponse();
  }

  async connect(): Promise<void> {
    console.log(`Connecting to FTP: ${this.config.host}:${this.config.port}`);

    this.conn = await Deno.connect({
      hostname: this.config.host,
      port: this.config.port,
    });

    this.reader = this.conn.readable.getReader();
    this.writer = this.conn.writable.getWriter();

    await this.readResponse(); // Welcome message
    await this.sendCommand(`USER ${this.config.username}`);
    await this.sendCommand(`PASS ${this.config.password}`);
    await this.sendCommand("TYPE I"); // Binary mode
  }

  async createDirectory(dirPath: string): Promise<boolean> {
    try {
      const fullPath = `${this.config.basePath}/${dirPath}`;
      console.log(`Creating directory: ${fullPath}`);

      const response = await this.sendCommand(`MKD ${fullPath}`);
      return response.startsWith("257") || response.includes("exists");
    } catch (error) {
      console.error("Error creating directory:", error);
      return false;
    }
  }

  async uploadFile(remotePath: string, content: Uint8Array): Promise<boolean> {
    try {
      const fullPath = `${this.config.basePath}/${remotePath}`;
      console.log(`Uploading to: ${fullPath} (${content.length} bytes)`);

      const pasvResponse = await this.sendCommand("PASV");
      const match = pasvResponse.match(/\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);

      if (!match) {
        throw new Error("Failed to parse PASV response: " + pasvResponse);
      }

      const dataPort = parseInt(match[5]) * 256 + parseInt(match[6]);
      console.log(`Opening data connection on port ${dataPort}`);

      const dataConn = await Deno.connect({
        hostname: this.config.host,
        port: dataPort,
      });

      const storPromise = this.sendCommand(`STOR ${fullPath}`);
      await dataConn.write(content);
      await dataConn.close();
      await storPromise;

      console.log(`Successfully uploaded: ${fullPath}`);
      return true;
    } catch (error) {
      console.error("Error uploading file:", error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.conn) {
      try {
        await this.sendCommand("QUIT");
      } catch (error) {
        console.error("Error during disconnect:", error);
      }
      this.reader?.releaseLock();
      this.writer?.releaseLock();
      this.conn.close();
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  let ftpClient: FTPClient | null = null;

  try {
    const { companyId } = await req.json();

    if (!companyId) {
      throw new Error("Company ID is required");
    }

    console.log(`Starting FTP sync for company: ${companyId}`);

    const ftpConfig: FTPConfig = {
      host: (Deno.env.get("FTP_HOST") || "").replace("ftp://", ""),
      port: parseInt(Deno.env.get("FTP_PORT") || "5541"),
      username: Deno.env.get("FTP_USERNAME") || "",
      password: Deno.env.get("FTP_PASSWORD") || "",
      basePath: "/",
    };

    console.log("FTP Config:", {
      host: ftpConfig.host,
      port: ftpConfig.port,
      username: ftpConfig.username,
      basePath: ftpConfig.basePath,
    });

    ftpClient = new FTPClient(ftpConfig);
    await ftpClient.connect();

    // Create company directories
    const categories = ["", "curriculum", "modelli", "uniemens", "f24", "770", "cu", "altri"];

    for (const category of categories) {
      const dirPath = category ? `${companyId}/${category}` : companyId;
      await ftpClient.createDirectory(dirPath);
    }

    // Get all documents for this company
    const { data: documents, error: dbError } = await supabaseClient
      .from("documents")
      .select("*")
      .eq("company_id", companyId);

    if (dbError) throw dbError;

    console.log(`Found ${documents?.length || 0} documents to sync`);

    const results = {
      total: documents?.length || 0,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    if (documents && documents.length > 0) {
      for (const doc of documents) {
        try {
          console.log(`Processing document: ${doc.file_name}`);

          // Download from Supabase Storage
          const { data: fileData, error: downloadError } = await supabaseClient.storage
            .from("documents")
            .download(doc.file_path);

          if (downloadError) {
            throw downloadError;
          }

          // Convert to Uint8Array
          const arrayBuffer = await fileData.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);

          // Upload to FTP
          const remotePath = `${companyId}/${doc.category}/${doc.file_name}`;
          const uploaded = await ftpClient.uploadFile(remotePath, uint8Array);

          if (uploaded) {
            results.successful++;
            console.log(`✓ Synced: ${doc.file_name}`);
            
            // Log successful upload
            await supabaseClient.from("ftp_upload_logs").insert({
              company_id: companyId,
              file_name: doc.file_name,
              file_category: doc.category,
              upload_status: "success",
              file_size: uint8Array.length,
            });
          } else {
            results.failed++;
            results.errors.push(`Failed to upload: ${doc.file_name}`);
            
            // Log failed upload
            await supabaseClient.from("ftp_upload_logs").insert({
              company_id: companyId,
              file_name: doc.file_name,
              file_category: doc.category,
              upload_status: "failed",
              error_message: "Upload failed",
              file_size: uint8Array.length,
            });
          }
        } catch (error) {
          results.failed++;
          const errorMsg = `Error syncing ${doc.file_name}: ${(error as Error).message}`;
          console.error(errorMsg);
          results.errors.push(errorMsg);
          
          // Log error
          await supabaseClient.from("ftp_upload_logs").insert({
            company_id: companyId,
            file_name: doc.file_name,
            file_category: doc.category,
            upload_status: "failed",
            error_message: (error as Error).message,
          });
        }
      }
    }

    await ftpClient.disconnect();

    console.log("Sync completed:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: "FTP sync completed",
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in sync-to-ftp function:", error);

    if (ftpClient) {
      try {
        await ftpClient.disconnect();
      } catch (disconnectError) {
        console.error("Error disconnecting FTP:", disconnectError);
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
