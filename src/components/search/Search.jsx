import React from "react";
import { Search as SearchIcon } from "lucide-react";

function Search({
    placeholder = "Search...",
    value = "",
    onChange = () => { },
    className = "",
    style = {}
}) {
    return (
        <div
            className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all max-w-[20rem] ${className}`}
            style={{
                backgroundColor: "var(--color-bg-input)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-dark)",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.07)",
                ...style,
            }}
        >
            <SearchIcon size={18} style={{ color: "var(--color-icon-3)" }} />

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent outline-none placeholder-gray-600"
                style={{
                    color: "var(--color-text-dark)",
                }}
            />
        </div>
    );
}

export default Search;
