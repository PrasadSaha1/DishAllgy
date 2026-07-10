import { useMemo } from "react";

function CuisineAutofill({
    suggestions,
    value,
    setValue,
    placeholder = "Search...",
    ...props
}) {

    const filteredSuggestions = useMemo(() => {
        if (!value) return suggestions;

        return suggestions.filter((item) =>
            item.toLowerCase().includes(value.toLowerCase())
        );
    }, [suggestions, value]);

    return (
        <div className="autocomplete-container">
            <input
                {...props}
                type="text"
                value={value}
                placeholder={placeholder}
                autoComplete="off"
                onChange={(e) => setValue(e.target.value)}
            />

            {value !== "" && filteredSuggestions.length > 0 && (
                <div className="list-group">
                    {filteredSuggestions.map((item) => (
                        <button
                            key={item}
                            type="button"
                            className="list-group-item list-group-item-action"
                            onClick={() => setValue(item)}
                            style={{width: "50%", margin: "auto"}}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CuisineAutofill;