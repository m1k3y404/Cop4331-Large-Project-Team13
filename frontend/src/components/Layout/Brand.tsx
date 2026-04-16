export default function Brand({ size = 22 }: { size?: number }) {
    return (
        <span
            style={{
                fontSize: size,
                fontWeight: 600,
                letterSpacing: "-0.5px",
                color: "var(--text-h)",
                fontFamily: "var(--heading)",
            }}
        >
            tilt<span className="tilt-brand-dot">.</span>
        </span>
    );
}
