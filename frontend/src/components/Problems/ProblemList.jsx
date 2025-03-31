import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import styles from "./Problems.module.css";
import DarkModeSwitch from "../common/DarkModeSwitch";

const fetchProblems = async (page, difficulty, status) => {
    try {
        const url = new URL(`http://localhost:5000/api/problems`);
        url.searchParams.append("page", page);
        if (difficulty !== "All") {
            url.searchParams.append("difficulty", difficulty);
        }
        if (status && status !== "All") {
            url.searchParams.append("status", status.toLowerCase());
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch problems");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching problems:", error);
        return { problems: [], total_pages: 0, current_page: 1 };
    }
};

const fetchCompletedProblems = async () => {
    try {
        const response = await fetch(
            "http://localhost:5000/api/problems/completed",
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error("Error fetching completed problems:", error);
        return [];
    }
};

const ProblemList = () => {
    const [problems, setProblems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [completedProblems, setCompletedProblems] = useState(new Set());
    const [selectedDifficulty, setSelectedDifficulty] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [pageInput, setPageInput] = useState("");
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const loadCompletedProblems = async () => {
            if (user) {
                const completed = await fetchCompletedProblems();
                setCompletedProblems(new Set(completed));
            }
        };
        loadCompletedProblems();
    }, [user]);

    useEffect(() => {
        const loadProblems = async () => {
            setLoading(true);
            try {
                const data = await fetchProblems(
                    currentPage,
                    selectedDifficulty,
                    selectedStatus
                );
                setProblems(data.problems);
                setTotalPages(data.total_pages);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadProblems();
    }, [currentPage, selectedDifficulty, selectedStatus]);

    const handleCheckboxChange = async (event, problemId) => {
        event.stopPropagation();

        if (!user) {
            console.error("User must be logged in to mark problems");
            return;
        }

        try {
            const isCompleted = completedProblems.has(problemId);
            const method = isCompleted ? "DELETE" : "POST";
            const url = `http://localhost:5000/api/problems/${problemId}/${
                isCompleted ? "uncomplete" : "complete"
            }`;

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCompletedProblems((prev) => {
                    const newSet = new Set(prev);
                    if (!data.completed) {
                        newSet.delete(problemId);
                    } else {
                        newSet.add(problemId);
                    }
                    return newSet;
                });
            }
        } catch (error) {
            console.error("Error updating problem status:", error);
        }
    };

    const handleRowClick = (problemId, event) => {
        if (event.target.type !== "checkbox") {
            navigate(`/problems/${problemId}`);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleDifficultyChange = (event) => {
        setSelectedDifficulty(event.target.value);
        setCurrentPage(1);
    };

    const handleStatusChange = (event) => {
        setSelectedStatus(event.target.value);
        setCurrentPage(1);
    };

    const handlePageInputChange = (e) => {
        setPageInput(e.target.value);
    };

    const handlePageInputSubmit = (e) => {
        e.preventDefault();
        const page = parseInt(pageInput);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setPageInput("");
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.problemList}>
                <div className={styles.header}>
                    <h1>Problem Set</h1>
                    <div className={styles.headerRight}>
                        <DarkModeSwitch />
                        <div className={styles.filters}>
                            <select
                                className={styles.filterSelect}
                                value={selectedDifficulty}
                                onChange={handleDifficultyChange}
                            >
                                <option value="All">All Difficulty</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                            <select
                                className={styles.filterSelect}
                                value={selectedStatus}
                                onChange={handleStatusChange}
                                disabled={!user}
                            >
                                <option value="All">All Status</option>
                                <option value="Solved">Solved</option>
                                <option value="Unsolved">Unsolved</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table>
                        <thead>
                            <tr>
                                <th className={styles.statusColumn}>Status</th>
                                <th className={styles.titleColumn}>Title</th>
                                <th>Difficulty</th>
                                <th>Acceptance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {problems.map((problem) => (
                                <tr
                                    key={problem.id}
                                    onClick={(e) =>
                                        handleRowClick(problem.id, e)
                                    }
                                    className={`${styles.problemRow} ${
                                        completedProblems.has(problem.id)
                                            ? styles.completed
                                            : ""
                                    }`}
                                >
                                    <td className={styles.statusCell}>
                                        {completedProblems.has(problem.id) ? (
                                            <span className={styles.solvedIcon}>
                                                ✓
                                            </span>
                                        ) : (
                                            <input
                                                type="checkbox"
                                                checked={completedProblems.has(
                                                    problem.id
                                                )}
                                                onChange={(e) =>
                                                    handleCheckboxChange(
                                                        e,
                                                        problem.id
                                                    )
                                                }
                                                className={styles.checkbox}
                                            />
                                        )}
                                    </td>
                                    <td className={styles.titleCell}>
                                        <span className={styles.problemTitle}>
                                            {problem.title}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={`${styles.difficulty} ${
                                                styles[
                                                    problem.difficulty.toLowerCase()
                                                ]
                                            }`}
                                        >
                                            {problem.difficulty}
                                        </span>
                                    </td>
                                    <td className={styles.acceptanceRate}>
                                        {problem.acceptance_rate
                                            ? `${problem.acceptance_rate.toFixed(
                                                  1
                                              )}%`
                                            : "N/A"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={styles.pagination}>
                    <button
                        className={styles.pageButton}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <form
                        onSubmit={handlePageInputSubmit}
                        className={styles.pageForm}
                    >
                        <input
                            type="number"
                            value={pageInput}
                            onChange={handlePageInputChange}
                            className={styles.pageInput}
                            placeholder="Go to page"
                            min="1"
                            max={totalPages}
                        />
                        <button type="submit" className={styles.pageGoButton}>
                            Go
                        </button>
                    </form>
                    <button
                        className={styles.pageButton}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProblemList;
