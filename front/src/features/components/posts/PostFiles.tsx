// components/posts/PostFiles.tsx
import { BACKEND_BASE } from "@/features/lib/api";
import FileLink from "./FileLink";
import { PostFilesProps } from "@/features/types";

export default function PostFiles({ files = [] }: PostFilesProps) {
  if (!files.length) return null;

  return (
    <div className="space-y-sm">
      {files.map((file) => (
        <FileLink key={file.id} url={`${BACKEND_BASE}${file.url}`} />
      ))}
    </div>
  );
}
