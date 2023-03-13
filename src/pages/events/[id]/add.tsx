import { SimpleGrid, TextInput, Textarea, Group, Button } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm, zodResolver } from "@mantine/form";
import router from "next/router";
import { z } from "zod";
import { api } from "../../../utils/api";

export default function AddEventPage() {
    const query = api.contact.getAll.useQuery();
    const mutation = api.event.create.useMutation();
    const form = useForm({
        validate: zodResolver(
            z.object({
                title: z.string()
                    .min(5, { message: 'Name should have at least 5 letters' })
                    .max(30, { message: 'Name should have maximum 20 letters' }),
                description: z.string()
                    .min(8, { message: 'Description should have at least 8 letters' }),
                date: z.date()
                    .min(new Date(), { message: 'Date should be after today' }),
                contactIds: z.string().array().nonempty({ message: 'At least one attendee has to be added' })
            })
        ),
        initialValues: {
            title: "",
            description: "",
            contactIds: [],
            date: undefined
        } as {
            title: string,
            description: string,
            date: Date | undefined
            contactIds: string[]
        }
    });

    const handleSubmit = form.onSubmit(data => {
        const { date, ...leftData } = data;
        return mutation.mutate({ date: date!, ...leftData })
    })

    return <>
        <form onSubmit={handleSubmit}>
            <SimpleGrid cols={1}>
                <TextInput
                    label="Title"
                    placeholder="My 10th birthday"
                    withAsterisk
                    {...form.getInputProps('title')}
                />
                <Textarea
                    label="Description"
                    placeholder="I would like to invite you to..."
                    withAsterisk
                    minRows={4}
                    {...form.getInputProps('description')}
                />
                <DateTimePicker
                    timeInputProps={{ 'aria-label': 'Pick time' }}
                    dropdownType="modal"
                    label="Pick date"
                    placeholder="Pick date"
                    withAsterisk
                    {...form.getInputProps('date')}
                />

                <Group grow spacing="xs">
                    <Button
                        variant="default"
                        onClick={() => router.push('/events')}
                    >Cancel</Button>
                    <Button
                        type="submit"
                        variant="outline"
                        color="dark"
                        disabled={!query.data || query.data.length <= 0}
                    >Create</Button>
                </Group>
            </SimpleGrid>
        </form>
    </>
}