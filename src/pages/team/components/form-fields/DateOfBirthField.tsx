
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '../AddTeamMemberDialog';

type DateOfBirthFieldProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
};

export function DateOfBirthField({ form }: DateOfBirthFieldProps) {
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");

  // Generate arrays for days, months, and years
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());

  // Initialize component state from form data
  useEffect(() => {
    if (form.getValues("date_of_birth")) {
      const dateStr = form.getValues("date_of_birth");
      const [yearVal, monthVal, dayVal] = dateStr.split('-');
      setYear(yearVal);
      setMonth(monthVal);
      setDay(dayVal);
    }
  }, [form]);

  // Update form value when any dropdown changes
  useEffect(() => {
    if (day && month && year) {
      const dateStr = `${year}-${month}-${day}`;
      form.setValue("date_of_birth", dateStr);
    }
  }, [day, month, year, form]);

  return (
    <FormField
      control={form.control}
      name="date_of_birth"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Date of Birth</FormLabel>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                value={day}
                onValueChange={(value) => {
                  setDay(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select
                value={month}
                onValueChange={(value) => {
                  setMonth(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select
                value={year}
                onValueChange={(value) => {
                  setYear(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
