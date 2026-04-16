import { Button, Layout, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import { ArrowRightOutlined, EditOutlined, MessageOutlined, SafetyOutlined } from "@ant-design/icons";
import { Link } from "react-router";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import Nav from "../components/Layout/Nav";
import Brand from "../components/Layout/Brand";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i: number = 0) => ({ opacity: 1, y: 0, transition: { ...spring, delay: 0.08 * i } }),
};

export function Index() {
    return (
        <Layout style={{ background: "var(--bg)", minHeight: "100dvh", overflowX: "hidden" }}>
            <Content>
                <Nav />
                <Hero />
                <FeatureStrip />
                <Collage />
                <PostsStream />
                <Footer />
            </Content>
        </Layout>
    );
}

function Hero() {
    const ref = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const cardsY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -120]);
    const textY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -40]);

    return (
        <section
            ref={ref}
            style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
                alignItems: "center",
                gap: 48,
                padding: "96px 48px 80px",
                textAlign: "left",
                position: "relative",
            }}
        >
            <motion.div style={{ y: textY }}>
                <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0}>
                    <Typography.Text
                        style={{
                            display: "inline-block",
                            padding: "5px 12px",
                            borderRadius: 999,
                            border: "1px solid var(--border)",
                            fontSize: 13,
                            color: "var(--text)",
                            marginBottom: 24,
                            letterSpacing: 0.3,
                            background: "var(--social-bg)",
                        }}
                    >
                        A blog about differing views
                    </Typography.Text>
                </motion.div>

                <motion.h1
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    custom={1}
                    style={{
                        fontSize: "clamp(56px, 8vw, 104px)",
                        lineHeight: 0.95,
                        letterSpacing: "-2.8px",
                        margin: "0 0 20px",
                        color: "var(--text-h)",
                        fontWeight: 600,
                    }}
                >
                    Read what<br />
                    <span style={{ color: "var(--accent)" }}>speaks</span> to you.
                </motion.h1>

                <motion.div initial="hidden" animate="show" variants={fadeUp} custom={2}>
                    <Typography.Paragraph
                        style={{
                            fontSize: 18,
                            color: "var(--text)",
                            maxWidth: "50ch",
                            margin: "0 0 32px",
                            lineHeight: 1.55,
                        }}
                    >
                        Tilt is a blog for people with an opinion. Post your take, comment on others, and see the feed leaning toward what actually moves you.
                    </Typography.Paragraph>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    custom={3}
                    style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}
                >
                    <Link to="/register">
                        <Button type="primary" size="large" icon={<ArrowRightOutlined />} iconPosition="end">
                            Create account
                        </Button>
                    </Link>
                    <Link to="/login" style={{ color: "var(--text-h)", fontSize: 15, padding: "8px 12px" }}>
                        I already have one
                    </Link>
                </motion.div>
            </motion.div>

            <motion.div
                style={{
                    y: cardsY,
                    position: "relative",
                    aspectRatio: "4 / 5",
                    borderRadius: 20,
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    background: "linear-gradient(135deg, var(--accent-bg) 0%, transparent 55%), var(--code-bg)",
                    display: "flex",
                    flexDirection: "column",
                    padding: 24,
                    gap: 12,
                    boxShadow: "var(--shadow)",
                }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0, transition: { ...spring, delay: 0.3 } }}
            >
                <MockPost title="Why I stopped reading Twitter" meta="choppachin  ·  3 min read" delay={0.5} />
                <MockPost title="Running a droplet on 1 GB of RAM" meta="vtgit  ·  5 min read" delay={0.6} />
                <MockPost title="I shipped my finals project at 4 am" meta="dechante  ·  2 min read" delay={0.7} />
                <MockPost title="The only CSS tip that mattered" meta="linguine  ·  4 min read" delay={0.8} />
            </motion.div>
        </section>
    );
}

function MockPost({ title, meta }: { title: string; meta: string; delay?: number }) {
    return (
        <motion.div
            whileHover={{ y: -2, transition: spring }}
            style={{
                padding: "16px 18px",
                borderRadius: 12,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                cursor: "default",
            }}
        >
            <span style={{ color: "var(--text-h)", fontWeight: 500, fontSize: 15, display: "block" }}>
                {title}
            </span>
            <span style={{ color: "var(--text)", fontSize: 13 }}>{meta}</span>
        </motion.div>
    );
}

function FeatureStrip() {
    const items = [
        { icon: <EditOutlined />, label: "Auto-tagged posts", body: "Tags generated from title and content when you hit publish." },
        { icon: <MessageOutlined />, label: "Threaded comments", body: "Comment on any post, delete your own, see the whole thread." },
        { icon: <SafetyOutlined />, label: "Verified accounts", body: "Real email verification and password reset via Resend." },
    ];
    return (
        <motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ show: { transition: { staggerChildren: 0.12 } } }}
            style={{
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                textAlign: "left",
            }}
        >
            {items.map((item, i) => (
                <motion.div
                    key={item.label}
                    variants={fadeUp}
                    style={{
                        padding: "40px 32px",
                        borderRight: i < items.length - 1 ? "1px solid var(--border)" : undefined,
                    }}
                >
                    <div style={{ color: "var(--accent)", fontSize: 22, marginBottom: 12 }}>{item.icon}</div>
                    <span style={{ display: "block", color: "var(--text-h)", fontWeight: 500, marginBottom: 6, fontSize: 16 }}>
                        {item.label}
                    </span>
                    <span style={{ color: "var(--text)", fontSize: 14, lineHeight: 1.55 }}>
                        {item.body}
                    </span>
                </motion.div>
            ))}
        </motion.section>
    );
}

function PostsStream() {
    const ref = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const x = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [80, -80]);

    const headlines = [
        "Losing an argument gracefully",
        "The case for slower internet",
        "How to post without screaming",
        "Five books I'm actually reading",
        "The feed you thought you wanted",
        "What happens when you log off",
        "A post about writing posts",
        "The difference between loud and right",
    ];

    return (
        <section
            ref={ref}
            style={{
                padding: "80px 0",
                overflow: "hidden",
                textAlign: "left",
            }}
        >
            <div style={{ padding: "0 48px", marginBottom: 28 }}>
                <span
                    style={{
                        fontSize: 13,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                        color: "var(--text)",
                    }}
                >
                    What people wrote today
                </span>
                <Typography.Title
                    level={2}
                    style={{
                        fontSize: "clamp(32px, 4vw, 48px)",
                        letterSpacing: "-1.2px",
                        margin: "8px 0 0",
                        color: "var(--text-h)",
                        fontWeight: 500,
                        maxWidth: "24ch",
                    }}
                >
                    Small thoughts, sharp takes, honest writing.
                </Typography.Title>
            </div>

            <motion.div
                style={{
                    display: "flex",
                    gap: 16,
                    x,
                    width: "max-content",
                }}
            >
                {[...headlines, ...headlines].map((h, i) => (
                    <div
                        key={i}
                        style={{
                            padding: "18px 22px",
                            borderRadius: 14,
                            border: "1px solid var(--border)",
                            background: "var(--bg)",
                            color: "var(--text-h)",
                            fontWeight: 500,
                            fontSize: 16,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {h}
                    </div>
                ))}
            </motion.div>
        </section>
    );
}

// scroll-scrubbed typographic collage, each token fades in tied to scroll position -dechante
type Token =
    | { kind: "word"; text: string; italic?: boolean; accent?: boolean }
    | { kind: "pill" | "arch" | "chooseCompound" };

const COLLAGE_TOKENS: Token[] = [
    { kind: "word", text: "Every" }, { kind: "word", text: "feed" }, { kind: "word", text: "sounds" },
    { kind: "word", text: "the" }, { kind: "word", text: "same." },
    { kind: "word", text: "Tilt", italic: true, accent: true }, { kind: "word", text: "doesn't.", italic: true, accent: true },
    { kind: "pill" },
    { kind: "word", text: "You" }, { kind: "word", text: "post" }, { kind: "word", text: "a" },
    { kind: "word", text: "take," }, { kind: "word", text: "read" }, { kind: "word", text: "a" },
    { kind: "word", text: "dissent," }, { kind: "word", text: "follow" }, { kind: "word", text: "the" },
    { kind: "word", text: "voice", italic: true, accent: true }, { kind: "word", text: "that" }, { kind: "word", text: "lands." },
    { kind: "word", text: "You" }, { kind: "word", text: "don't" }, { kind: "word", text: "scroll." },
    { kind: "word", text: "You" }, { kind: "chooseCompound" }, { kind: "word", text: "what" },
    { kind: "word", text: "speaks.", accent: true },
    { kind: "word", text: "Quiet" }, { kind: "word", text: "writing" },
    { kind: "arch" },
    { kind: "word", text: "for" }, { kind: "word", text: "people" }, { kind: "word", text: "who'd" },
    { kind: "word", text: "rather" }, { kind: "word", text: "think" }, { kind: "word", text: "than" },
    { kind: "word", text: "shout." },
];

// purple gradient pill + eye-closeup for "oo" + moody archway, picked to match tilt's dark accent theme -dechante
const PILL_URL = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80";
const DOT_URL = "https://images.unsplash.com/photo-1500353391678-d7b57979d6d2?w=400&auto=format&fit=crop&q=80";
const ARCH_URL = "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&auto=format&fit=crop&q=80";

function Collage() {
    const ref = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    // reveal completes while section is still in view so page end doesnt cut it off -dechante
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "end 0.7"] });
    const total = COLLAGE_TOKENS.length;

    return (
        <section
            ref={ref}
            style={{
                padding: "160px 48px 140px",
                textAlign: "center",
                position: "relative",
                borderTop: "1px solid var(--border)",
            }}
        >
            <style>{`
                .collage-img { filter: grayscale(1); transition: filter 0.4s ease, transform 0.4s ease; }
                .collage-img:hover { filter: grayscale(0); transform: scale(1.05); }
            `}</style>
            <p
                style={{
                    maxWidth: "20ch",
                    margin: "0 auto",
                    fontSize: "clamp(40px, 6vw, 88px)",
                    lineHeight: 1.1,
                    letterSpacing: "-2px",
                    color: "var(--text-h)",
                    fontWeight: 500,
                    fontFamily: "var(--heading)",
                }}
            >
                {COLLAGE_TOKENS.map((token, i) => (
                    <CollageToken
                        key={i}
                        token={token}
                        index={i}
                        total={total}
                        scrollYProgress={scrollYProgress}
                        reduced={!!reduced}
                    />
                ))}
            </p>
        </section>
    );
}

function CollageToken({
    token,
    index,
    total,
    scrollYProgress,
    reduced,
}: {
    token: Token;
    index: number;
    total: number;
    scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
    reduced: boolean;
}) {
    // each token starts fading in at its own scroll slice and finishes a bit later so consecutive tokens overlap -dechante
    const span = 1 / total;
    const start = index * span;
    const end = Math.min(1, start + span * 2.5);
    const opacity = useTransform(scrollYProgress, [start, end], reduced ? [1, 1] : [0.12, 1]);
    const y = useTransform(scrollYProgress, [start, end], reduced ? [0, 0] : [8, 0]);

    if (token.kind === "word") {
        const italicStyle: React.CSSProperties = token.italic
            ? { fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontWeight: 400 }
            : {};
        const colorStyle: React.CSSProperties = token.accent ? { color: "var(--accent)" } : {};
        return (
            <>
                <motion.span style={{ opacity, y, display: "inline-block", ...italicStyle, ...colorStyle }}>
                    {token.text}
                </motion.span>{" "}
            </>
        );
    }

    if (token.kind === "pill") {
        return (
            <motion.span
                aria-hidden="true"
                className="collage-img"
                style={{
                    opacity,
                    y,
                    display: "inline-block",
                    width: "14vw",
                    height: "5vw",
                    minHeight: 52,
                    borderRadius: "5vw",
                    backgroundImage: `url(${PILL_URL})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    verticalAlign: "middle",
                    margin: "0 0.25em",
                }}
            />
        );
    }

    if (token.kind === "chooseCompound") {
        const dotStyle: React.CSSProperties = {
            display: "inline-block",
            width: "0.9em",
            height: "0.9em",
            borderRadius: "50%",
            backgroundImage: `url(${DOT_URL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            verticalAlign: "baseline",
            margin: "0 0.02em",
        };
        return (
            <>
                <motion.span style={{ opacity, y, display: "inline-block" }}>
                    ch
                    <span aria-hidden="true" className="collage-img" style={dotStyle} />
                    <span aria-hidden="true" className="collage-img" style={dotStyle} />
                    se
                </motion.span>{" "}
            </>
        );
    }

    // arch
    return (
        <motion.span
            aria-hidden="true"
            className="collage-img"
            style={{
                opacity,
                y,
                display: "inline-block",
                width: "1.2em",
                height: "1.5em",
                borderTopLeftRadius: "1.2em",
                borderTopRightRadius: "1.2em",
                backgroundImage: `url(${ARCH_URL})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                verticalAlign: "-0.25em",
                margin: "0 0.08em",
            }}
        />
    );
}

function Footer() {
    return (
        <section
            style={{
                borderTop: "1px solid var(--border)",
                padding: "32px 48px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 13,
                color: "var(--text)",
                textAlign: "left",
                gap: 16,
                flexWrap: "wrap",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Brand size={18} />
                <span>COP4331 Team 13  ·  Spring 2026</span>
            </div>
            <div style={{ display: "flex", gap: 18 }}>
                <Link to="/login" style={{ color: "var(--text)" }}>Log in</Link>
                <Link to="/register" style={{ color: "var(--text)" }}>Register</Link>
            </div>
        </section>
    );
}
