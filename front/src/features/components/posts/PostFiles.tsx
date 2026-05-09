// components/posts/PostFiles.tsx
import { API_URL } from "@/features/lib/api";
import FileLink from "./FileLink";
import { PostFilesProps } from "@/features/types";

export default function PostFiles({ files = [] }: PostFilesProps) {
  if (!files.length) return null;

  return (
    <div className="space-y-sm">
      {files.map((file) => (
        <FileLink key={file.id} url={`${API_URL}${file.url}`} />
      ))}
    </div>
  );
}
