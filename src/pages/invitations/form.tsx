import { useForm } from "react-hook-form";
import { Button, TextInput, Label, Textarea } from "flowbite-react";
import { FormProvider } from "react-hook-form";
import { api } from "../../utils/api";
import { useRouter } from "next/router";
import DatePicker from "../../components/Forms/DatePicker";
import GuestsInput from "../../components/Forms/GuestsInput";
import InputLayout from "../../components/Forms/InputLayout";

export default function () {
    const mutation = api.invitation.create.useMutation();
    const router = useRouter();
    const submit = async (data: {
        title: string;
        date: Date;
        description: string;
        guests: {
            name: string;
        }[];
    }) => {
        await mutation.mutateAsync(data);
        router.push('/')
    }

    const methods = useForm({
        defaultValues: {
            title: "",
            date: new Date(),
            description: "",
            guests: [{ name: '' }]
        }
    });

    return (
        <FormProvider {...methods} >
            <form onSubmit={methods.handleSubmit(submit)} >
                <InputLayout value="Title">
                    <TextInput
                        id="title"
                        placeholder="e.g My birthady party or prom"
                        required={true}
                        sizing="lg"
                        {...methods.register('title')}
                    />
                </InputLayout>

                <InputLayout value="Description">
                    <Textarea
                        id="comment"
                        placeholder="e.g Hello Dear friend, I would lie to invite you..."
                        required={true}
                        rows={6}
                        {...methods.register('description')}
                    />
                </InputLayout>

                <InputLayout value="Date">
                    <DatePicker setDate={(v: Date) => methods.setValue("date", v)} />
                </InputLayout>

                <GuestsInput />
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 max-[640px]:w-full" type="submit">Submit</Button>
            </form>
        </FormProvider>
    );
}

// const Tip = ({ content }: { content: string }) => <Tooltip
//     content={content}
//     style="light"
//     animation="duration-300"
// ><button type="button" className="ml-5 flex justify-center"><FaInfoCircle /></button></Tooltip>