import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

interface UploadDocumentParams {
  fileName: string;
  category: string;
  companyId: string;
  pdfDoc?: jsPDF;
  pdfBlob?: Blob;
}

export const uploadDocumentToStorageAndFTP = async ({
  fileName,
  category,
  companyId,
  pdfDoc,
  pdfBlob,
}: UploadDocumentParams) => {
  try {
    // Get the PDF blob
    let blob: Blob;
    if (pdfDoc) {
      blob = pdfDoc.output("blob");
    } else if (pdfBlob) {
      blob = pdfBlob;
    } else {
      throw new Error("Either pdfDoc or pdfBlob must be provided");
    }

    // Upload to Supabase Storage
    const filePath = `${companyId}/${category}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, blob, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Create document record
    const { data: userData } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from("documents").insert({
      company_id: companyId,
      file_name: fileName,
      file_path: filePath,
      file_size: blob.size,
      mime_type: "application/pdf",
      category: category,
      uploaded_by: userData.user?.id,
    });

    if (insertError) throw insertError;

    // Sync to FTP
    const { error: ftpError } = await supabase.functions.invoke("sync-to-ftp", {
      body: { companyId },
    });

    if (ftpError) {
      console.error("FTP sync error:", ftpError);
      // Don't throw - FTP sync is not critical
    }

    return { success: true };
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};
