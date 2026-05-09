import { FiSearch } from "react-icons/fi";

import FormInput from "../forms/FormInput";

type SearchInputProps = {
  value: string;
  className?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

export default function SearchInput({
  value,
  onChange,
  className,
}: SearchInputProps) {
  return (
    <div className={`relative w-full ${className ?? ""}`}>
      <FormInput
        value={value}
        onChange={onChange}
        placeholder="Search users..."
        className={`min-h-full  opacity-30   ${className ?? ""}`}
      />
      <button
        type="submit"
        className="absolute right-md top-1/2 transform -translate-y-1/2 u-text-tertiary focus:outline-none"
        aria-label="Search"
      >
        <FiSearch className="h-5 w-5" />
      </button>
    </div>
  );
}
