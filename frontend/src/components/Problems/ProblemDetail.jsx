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
                            Acceptance: {problem.acceptance_rate.toFixed(1)}%
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.description}>
                    {problem.description.split("\n").map((paragraph, index) => {
                        if (paragraph.trim().startsWith("```")) {
                            // Handle code blocks
                            return (
                                <pre key={index}>
                                    <code>
                                        {paragraph.replace(/```/g, "").trim()}
                                    </code>
                                </pre>
                            );
                        } else if (paragraph.includes("`")) {
                            // Handle inline code
                            return (
                                <p key={index}>
                                    {paragraph
                                        .split("`")
                                        .map((part, i) =>
                                            i % 2 === 0 ? (
                                                part
                                            ) : (
                                                <code key={i}>{part}</code>
                                            )
                                        )}
                                </p>
                            );
                        }
                        return <p key={index}>{paragraph}</p>;
                    })}
                </div>

                {problem.similar_questions &&
                    problem.similar_questions.length > 0 && (
                        <div className={styles.similarProblems}>
                            <h3>Similar Questions</h3>
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
                    )}
            </div>
        </div>
    );
};

export default ProblemDetail;
