export type FileUploadInputProps = {
  name: string;
  label?: string;
  accept?: string;
  onChange: (file: File | null) => void;
  selectedFile?: File | null;
  className?: string;
};
