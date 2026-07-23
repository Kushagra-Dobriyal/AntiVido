import type { Metadata } from "next";

import type { ReactNode } from 'react';


export const metadata: Metadata = {
    title: "UserDashboard",
    description: "Monitor your storage and token usage",
};

export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <h1>UserDashboard</h1>
            {children}
        </div>
    );
}
