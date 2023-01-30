import { GetStaticPropsContext } from "next";
import { prisma } from "../../server/db";
import { Label, Select, Table } from "flowbite-react";
import Head from "next/head";
import { FaCheck, FaTimes } from "react-icons/fa";
import Layout from "../../components/Layout";
import { Card } from "flowbite-react";
import RemoveModal from "../../components/Modals/RemoveModal";
import QrModal from "../../components/QrModal";
import QrDownload from "../../components/QrDownload";
import { Invitation, Guest } from "@prisma/client";
import { serialize } from "superjson";
import { useState } from "react";
export async function getStaticPaths() {
    const invitations: { id: string }[] = await prisma.invitation.findMany({
        where: {},
        select: {
            id: true
        }
    })
    const paths = invitations.map((invitation: { id: string }) => ({
        params: { id: invitation.id },
    }))

    return { paths, fallback: false }
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
    const invitation = await prisma.invitation.findUnique({
        where: { id: params!.id as string },
        include: { guests: true }
    })

    return {
        props: {
            invitation: serialize({
                ...invitation, date: invitation?.date.toDateString()
            }).json
        },
        revalidate: 10
    }
}

export default function ({ invitation }: { invitation: Invitation & { guests: Guest[] } & { date: string } }) {
    const [order, setOrder] = useState<string>('All');

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => setOrder(e.target.value)
    const data = (() => {
        if (order === "Attending") return invitation.guests.filter(g => g.attending === true);
        if (order === "Not Attending") return invitation.guests.filter(g => g.attending === false);
        return invitation.guests;

    })()


    return <>
        <Head>
            <title>{invitation.title}</title>
        </Head>
        <Layout>
            <main className="mt-20 mb-16">
                <Card className="mx-2">
                    <div className="flex w-full items-center justify-between">
                        <h5 className="text-2xl font-bold  truncate">{invitation.title}</h5>
                        <RemoveModal />
                    </div>
                    <div className="flex w-full items-center text-gray-700 tracking-tight text-xs justify-between">
                        <p>On:  <b>{invitation.date}</b></p>
                    </div>
                    <p className="text-sm">{invitation.description}</p>
                </Card>
                <div className="mb-2 block">
                    <Label
                        htmlFor="show"
                        value="Show: "
                    />
                </div>
                <Select
                    id="show"
                    className="w-fit"
                    onChange={handleChange}
                >
                    <option>All</option>
                    <option>Attending</option>
                    <option>Not Attending</option>
                </Select>
                <Table className="w-full mt-5">
                    <Table.Head>
                        <Table.HeadCell>
                            Name
                        </Table.HeadCell>
                        <Table.HeadCell>
                            Attending
                        </Table.HeadCell>
                        <Table.HeadCell>
                        </Table.HeadCell>
                        <Table.HeadCell>
                        </Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                        {data.map((g, i) => (
                            <Table.Row key={i}>
                                <Table.Cell className="whitespace-nowrap font-medium text-gray-900">
                                    {g.name}
                                </Table.Cell>
                                <Table.Cell className="flex justify-center">
                                    {g.attending ? <FaCheck style={{ color: '#22c55e' }} /> : <FaTimes style={{ color: '#ef4444' }} />}
                                </Table.Cell>
                                {/*  */}
                                <QrModal url={g.name} name={g.name} />
                                <QrDownload />
                            </Table.Row>
                        ))}

                    </Table.Body >
                </Table>
            </main>
        </Layout>
    </>
}