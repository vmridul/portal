import { supabase } from "@/lib/supabase/client";

export const uploadFile = async ({
  file,
  bucket,
}: {
  file: File;
  bucket: string;
}) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return { url: publicUrl, originalName: file.name };
};
