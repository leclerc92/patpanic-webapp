import React from "react";

export const StickyFooter = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="fixed bottom-0 left-0 w-full z-50 p-4 pb-6 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
            <div className="container max-w-md mx-auto">
                {children}
            </div>
        </div>
    );
};