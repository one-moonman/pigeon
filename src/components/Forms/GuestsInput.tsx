import { useFormContext } from "react-hook-form";
import { Button, Label, TextInput } from "flowbite-react";
import { FaTrash, FaPlus } from "react-icons/fa";
import { useFieldArray, type FieldValues } from "react-hook-form";
import TrashButton from "../Buttons/TrashButton";
import ErrorCard from "../Cards/ErrorCard";
import { MdGroup } from "react-icons/md";

export default function GuestsInput() {
    const methods = useFormContext();
    const { fields, insert, remove, replace } = useFieldArray({
        control: methods.control,
        name: "guests",
        rules: {
            required: true,
        }
    });
    return <>
        <div className="text-lg mt-4 mb-2 flex justify-between items-center">
            <Label value="Guests" />
            <p className="flex items-center">
                <MdGroup className="w-4 aspect-square mr-2" />
                <b>{fields.length}</b>
            </p>
        </div>
        <div className="flex items-center justify-between">
            <Button gradientDuoTone="cyanToBlue"
                outline={true}
                onClick={() => insert(0, "")}
            >Add guest<FaPlus className="ml-5" /></Button>
            <Button
                style={{ background: '#9CA3AF' }}
                outline={true}
                onClick={() => replace([""])}
            >Clear all<FaTrash className="ml-5" /></Button>
        </div>
        {fields.map((field, index) => {
            const errors = methods.formState.errors.guests;
            return <div className="my-2" key={field.id}>
                <div className={`${fields.length === 1 ? `block` : `flex items-center`} h-fit max-[640px]:w-full`}>
                    <TextInput
                        id="guest-input"
                        placeholder="e.g John Doe"
                        required={true}
                        sizing="lg"
                        className="max-[640px]:w-full"
                        {...methods.register(`guests.${index}.name` as const, {
                            pattern: {
                                value: /[\p{L} '.,]+/i,
                                message: "Please provide only valid names!"
                            },
                            // This hack saved me but is not good for the long term
                            validate: (value: string, formValues: Record<string, { name: string }[]>) => {
                                if (formValues.guests === undefined) return;
                                const existing: string[] = formValues.guests
                                    .map((g: { name: string }) => g.name)
                                    .map((str: string) => str.replace(/\s/g, ''))
                                const unique = existing.lastIndexOf(value.replace(/\s/g, ''));
                                // could be broken
                                return unique === index || "Please provide only unique names!";
                            }
                        })}
                    />
                    {fields.length > 1 ? <TrashButton onClick={() => remove(index)} /> : null}
                </div>
                {errors && Object.values(errors)[index] ? <ErrorCard className="mt-2">
                    <span>{
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        Object.values(errors)[index].name.message
                    }</span>
                </ErrorCard> : null}
            </div>
        })}
    </>
}
