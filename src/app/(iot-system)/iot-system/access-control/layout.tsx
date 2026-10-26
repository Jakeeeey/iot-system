import React from "react";

export default function AccessControlLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col flex-1 min-h-0 w-full h-full overflow-hidden bg-[#0c1017]">
            {children}
        </div>
    );
}