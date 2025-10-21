
import { FC, ChangeEvent } from 'react';

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const FormInput: FC<FormInputProps> = ({ id, label, type = 'text', placeholder, value, onChange, required = true }) => (
  <div className="mb-6">
    <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-300">
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400 transition-colors duration-300 ease-in-out"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

export default FormInput;