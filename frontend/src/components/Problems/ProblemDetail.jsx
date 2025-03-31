import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./ProblemDetail.module.css";

const ProblemDetail = () => {
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `http://localhost:5000/api/problems/${id}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch problem");
                }

                const data = await response.json();
                setProblem(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [id]);

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;
    if (!problem)
        return <div className={styles.notFound}>Problem not found</div>;

    return (
        <div className={styles.container}>
            <div className={styles.problemDetail}>
                <div className={styles.header}>
                    <h1>{problem.title}</h1>
                    <div className={styles.metadata}>
                        <span
                            className={`${styles.difficulty} ${
                                styles[problem.difficulty.toLowerCase()]
                            }`}
                        >
                            {problem.difficulty}
                        </span>
                        {problem.acceptance_rate && (
                            <span className={styles.acceptanceRate}>
                                Acceptance: {problem.acceptance_rate.toFixed(1)}
                                %
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.content}>
                    {/* Problem Statement Section */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            Problem Statement
                        </h2>
                        <div className={styles.description}>
                            {problem.description
                                .split("\n")
                                .map((paragraph, index) => {
                                    if (paragraph.trim().startsWith("```")) {
                                        return (
                                            <pre key={index}>
                                                <code>
                                                    {paragraph
                                                        .replace(/```/g, "")
                                                        .trim()}
                                                </code>
                                            </pre>
                                        );
                                    } else if (paragraph.includes("`")) {
                                        return (
                                            <p key={index}>
                                                {paragraph
                                                    .split("`")
                                                    .map((part, i) =>
                                                        i % 2 === 0 ? (
                                                            part
                                                        ) : (
                                                            <code key={i}>
                                                                {part}
                                                            </code>
                                                        )
                                                    )}
                                            </p>
                                        );
                                    }
                                    return <p key={index}>{paragraph}</p>;
                                })}
                        </div>
                    </section>

                    {/* Examples Section */}
                    {problem.examples && problem.examples.length > 0 && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Examples</h2>
                            <div className={styles.examples}>
                                {problem.examples.map((example, i) => (
                                    <div key={i} className={styles.example}>
                                        <h4>Example {i + 1}:</h4>
                                        <div className={styles.exampleContent}>
                                            {example.input && (
                                                <div
                                                    className={
                                                        styles.exampleItem
                                                    }
                                                >
                                                    <span>Input:</span>
                                                    <pre>{example.input}</pre>
                                                </div>
                                            )}
                                            {example.output && (
                                                <div
                                                    className={
                                                        styles.exampleItem
                                                    }
                                                >
                                                    <span>Output:</span>
                                                    <pre>{example.output}</pre>
                                                </div>
                                            )}
                                            {example.explanation && (
                                                <div
                                                    className={
                                                        styles.exampleItem
                                                    }
                                                >
                                                    <span>Explanation:</span>
                                                    <p>{example.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Constraints Section */}
                    {problem.constraints && problem.constraints.length > 0 && (
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Constraints</h2>
                            <div className={styles.constraints}>
                                <ul>
                                    {problem.constraints.map(
                                        (constraint, i) => (
                                            <li key={i}>{constraint}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                        </section>
                    )}

                    {/* Similar Problems Section */}
                    {problem.similar_questions &&
                        problem.similar_questions.length > 0 && (
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>
                                    Similar Problems
                                </h2>
                                <div className={styles.similarProblems}>
                                    <ul>
                                        {problem.similar_questions.map(
                                            (question, index) => (
                                                <li key={index}>
                                                    <a
                                                        href={`/problems/${question[1]}`}
                                                    >
                                                        {question[0]}
                                                    </a>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            </section>
                        )}
                </div>
            </div>
        </div>
    );
};

export default ProblemDetail;
