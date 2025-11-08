import React from 'react';
import { View } from 'react-native';
import { Label } from '../atoms/Label';
import { Input } from '../atoms/Input';
import { ErrorText } from '../atoms/ErrorText';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  className = '',
}) => {
  return (
    <View className={`mb-4 ${className}`}>
      <Label text={label} required={required} />
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className={error ? 'border-red-500' : ''}
      />
      <ErrorText message={error} />
    </View>
  );
};
