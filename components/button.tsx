export function Button({ children, onClick = null, disabled = false }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
