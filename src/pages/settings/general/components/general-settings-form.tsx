
import React from 'react';
import { GeneralSettingField } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generalSettingFormSchema, GeneralSettingFormValues } from '../types';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface SettingItemProps {
  setting: GeneralSettingField;
  onUpdate: (name: string, value: string) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ setting, onUpdate }) => {
  const form = useForm<GeneralSettingFormValues>({
    resolver: zodResolver(generalSettingFormSchema),
    defaultValues: {
      value: setting.value,
    },
  });

  const handleSubmit = (data: GeneralSettingFormValues) => {
    onUpdate(setting.name, data.value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{setting.display_name}</FormLabel>
              {setting.type === 'select' && setting.options ? (
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${setting.display_name}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {setting.options.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : setting.type === 'number' ? (
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
              ) : (
                <FormControl>
                  <Input {...field} />
                </FormControl>
              )}
              {setting.description && (
                <FormDescription>{setting.description}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="sm"
            variant="outline"
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};

interface GeneralSettingsFormProps {
  settings: GeneralSettingField[];
  onUpdateSetting: (name: string, value: string) => void;
}

export const GeneralSettingsForm: React.FC<GeneralSettingsFormProps> = ({ 
  settings,
  onUpdateSetting
}) => {
  return (
    <div className="space-y-8">
      {settings.map(setting => (
        <div key={setting.name} className="border-b pb-6 last:border-b-0">
          <SettingItem 
            setting={setting} 
            onUpdate={onUpdateSetting} 
          />
        </div>
      ))}
    </div>
  );
};
