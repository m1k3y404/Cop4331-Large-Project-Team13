import { memo, useEffect, useRef, useState } from 'react';
import { SearchOutlined, ArrowRightOutlined } from '@ant-design/icons';

// isolated typewriter component so its interval doesn't rerender the search page -dechante
const SUGGESTIONS = [
    'why social media feels off',
    'posts about reading less',
    'people who actually write',
    'a quiet take on something loud',
    'dissent that makes sense',
    'the best short essay you read this week',
];

const TypewriterPlaceholder = memo(function TypewriterPlaceholder({ typing }: { typing: boolean }) {
    const [text, setText] = useState('');
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState<'typing' | 'holding' | 'erasing'>('typing');

    useEffect(() => {
        if (!typing) return; // pause when user is focused
        let t: ReturnType<typeof setTimeout>;
        const target = SUGGESTIONS[idx];

        if (phase === 'typing') {
            if (text.length < target.length) {
                t = setTimeout(() => setText(target.slice(0, text.length + 1)), 45);
            } else {
                t = setTimeout(() => setPhase('holding'), 1400);
            }
        } else if (phase === 'holding') {
            t = setTimeout(() => setPhase('erasing'), 0);
        } else {
            if (text.length > 0) {
                t = setTimeout(() => setText(text.slice(0, -1)), 22);
            } else {
                setIdx((i) => (i + 1) % SUGGESTIONS.length);
                setPhase('typing');
            }
        }
        return () => clearTimeout(t);
    }, [text, idx, phase, typing]);

    return (
        <span style={{ pointerEvents: 'none', color: 'color-mix(in srgb, var(--text) 70%, transparent)', fontSize: 18 }}>
            Try &ldquo;{text}
            <span className="tilt-cursor" aria-hidden="true">|</span>
            &rdquo;
        </span>
    );
});

interface SearchBarProps {
    value: string;
    onChange: (v: string) => void;
    onSubmit: (v: string) => void;
}

export default function SearchBar({ value, onChange, onSubmit }: SearchBarProps) {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const showPlaceholder = !focused && value.length === 0;

    return (
        <div
            onClick={() => inputRef.current?.focus()}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '18px 20px',
                borderRadius: 18,
                border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
                background: 'color-mix(in srgb, var(--code-bg) 40%, var(--bg))',
                boxShadow: focused ? '0 0 0 4px var(--accent-bg)' : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                cursor: 'text',
            }}
        >
            <SearchOutlined style={{ fontSize: 22, color: focused ? 'var(--accent)' : 'var(--text)' }} />

            <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                {showPlaceholder && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                        <TypewriterPlaceholder typing={!focused} />
                    </div>
                )}
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(value); }}
                    style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--text-h)',
                        fontSize: 18,
                        fontFamily: 'var(--sans)',
                        letterSpacing: 0.1,
                    }}
                />
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onSubmit(value); }}
                disabled={!value.trim()}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 16px',
                    borderRadius: 12,
                    border: 'none',
                    background: value.trim() ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 25%, transparent)',
                    color: value.trim() ? '#fff' : 'var(--text)',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: value.trim() ? 'pointer' : 'not-allowed',
                    transition: 'background 0.2s, transform 0.1s',
                }}
            >
                Search <ArrowRightOutlined />
            </button>
        </div>
    );
}
