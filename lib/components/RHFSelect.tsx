import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller, useFormContext } from "react-hook-form";
import type { SelectProps } from "@mui/material";
import { Checkbox, MenuItem } from "@mui/material";
import { FormControl, FormHelperText, InputLabel, Select } from "@mui/material";
import type { ReactElement } from "react";
import { useMemo } from "react";
import SelectRenderValue from "./partials/SelectRenderValue.tsx";
import type { SelectOptionBase } from "../types.ts";

/**
 * Interface defining the structure of an option item in the select field.
 * @extends SelectOptionBase - Base interface for the select options.
 */
interface OptionItem extends SelectOptionBase {
  /** The value of the option, which is used as the key */
  value: string;
}

type Props<T extends FieldValues> = Omit<SelectProps, "name"> & {
  /** The name of the field in the form state */
  readonly name: Path<T>;
  /** An array of option items to be displayed in the select dropdown */
  readonly options: OptionItem[];
  /** The control object from React Hook Form, optional if useFormContext is used */
  readonly control?: Control<T>;
  /** The direction of the text input, either left-to-right (ltr) or right-to-left (rtl) */
  readonly inputDir?: "ltr" | "rtl";
  /** The maximum height of the select input */
  readonly maxHeight?: number;
  /** The maximum height of the dropdown menu */
  readonly dropDownMaxHeight?: number;
};

/**
 * `RHFSelect` is a wrapper around MIUI's `Select` component that integrates with React Hook Form.
 * It supports both single and multiple selections and handles validation and error messages.
 *
 * - This component automatically handles the form control via React Hook Form and provides seamless integration.
 * - The `options` prop allows for dynamic option generation, including support for disabling options.
 *
 * @template T - A generic type for the form's field values, extending `FieldValues`.
 *
 * @param {Path<T>} name - The name of the field in the form state.
 * @param {OptionItem[]} options - An array of option items to be displayed in the select dropdown.
 * @param {Control<T>} [control] - The React Hook Form control object. If not provided, the form context will be used.
 * @param {"ltr" | "rtl"} [inputDir] - The direction of the text input, either left-to-right or right-to-left.
 * @param {number} [maxHeight] - The maximum height of the select input.
 * @param {number} [dropDownMaxHeight] - The maximum height of the dropdown menu.
 * @param {SelectProps} props - Additional props passed to the underlying MUI `Select`.
 *
 * @returns {ReactElement} A controlled select component integrated with React Hook Form.
 *
 * @example
 * ```tsx
 * <RHFSelect
 *   name="favoriteFruits"
 *   options={[
 *     { label: "Apple", value: "apple" },
 *     { label: "Banana", value: "banana" },
 *     { label: "Cherry", value: "cherry", disabled: true },
 *   ]}
 *   control={control} // Optional, if useFormContext is not used
 * />
 * ```
 *
 * @example
 * ```tsx
 * <RHFSelect
 *   name="selectedColors"
 *   options={[
 *     { label: "Red", value: "red" },
 *     { label: "Green", value: "green" },
 *     { label: "Blue", value: "blue" },
 *   ]}
 *   multiple
 *   inputDir="ltr"
 * />
 * ```
 */
export function RHFSelect<T extends FieldValues>({
  name,
  options,
  control,
  inputDir,
  maxHeight,
  dropDownMaxHeight,
  ...props
}: Props<T>): ReactElement {
  const formContext = useFormContext<T>();

  const isMultiple = useMemo(() => {
    return props.multiple === true;
  }, [props.multiple]);

  const innerOptions = useMemo(() => {
    const result: Record<string, OptionItem> = {};

    for (const o of options) {
      if (o.value in result) {
        console.warn("Duplicate option value for select component: ", o.value);
      }

      result[o.value] = o;
    }

    return result;
  }, [options]);

  return (
    <Controller
      name={name}
      control={control ?? formContext.control}
      render={({ field: { value, ...field }, fieldState: { error } }) => {
        return (
          <FormControl
            fullWidth={true}
            disabled={props.disabled}
            error={props.disabled !== true && error !== undefined}
          >
            <InputLabel>{props.label}</InputLabel>
            <Select
              {...props}
              error={props.disabled !== true && error !== undefined}
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
              value={value === undefined ? (isMultiple ? [] : "") : value}
              {...field}
              MenuProps={{
                ...props.MenuProps,
                slotProps: {
                  ...props.MenuProps?.slotProps,
                  paper: {
                    // eslint-disable-next-line @typescript-eslint/no-misused-spread
                    ...props.MenuProps?.slotProps?.paper,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    style: {
                      maxHeight: dropDownMaxHeight,
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-expect-error
                      ...props.MenuProps?.slotProps?.paper?.style
                    }
                  }
                }
              }}
              renderValue={
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                props.renderValue !== undefined
                  ? props.renderValue
                  : isMultiple
                    ? (s) => (
                        <SelectRenderValue
                          options={innerOptions}
                          selected={s as string[]}
                          maxHeight={maxHeight}
                          inputDir={inputDir}
                        />
                      )
                    : undefined
              }
            >
              {isMultiple
                ? Object.entries(innerOptions).map(([hash, option]) => (
                    <MenuItem value={hash} key={hash} disabled={option.disabled} dir={inputDir}>
                      <Checkbox checked={(value as string[]).includes(hash)} />
                      {option.label}
                    </MenuItem>
                  ))
                : Object.entries(innerOptions).map(([hash, option]) => (
                    <MenuItem value={hash} key={hash} disabled={option.disabled} dir={inputDir}>
                      {option.label}
                    </MenuItem>
                  ))}
            </Select>
            <FormHelperText>{error?.message ?? " "}</FormHelperText>
          </FormControl>
        );
      }}
    />
  );
}
