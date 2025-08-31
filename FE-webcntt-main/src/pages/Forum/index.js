import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./Forum.module.scss";

const cx = classNames.bind(styles);

function Forum() {
    const token = localStorage.getItem("auth_token");
    const [discussions, setDiscussions] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDiscussion, setSelectedDiscussion] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [currentId, setCurrentId] = useState(null);
    const urlApi = "http://localhost:8084";

    const fetchDiscussions = async (page) => {
        try {
            if (page >= totalPages) return;
            setIsLoading(true);

            const response = await fetch(
                `${urlApi}/api/discussions?page=${page}&size=5`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();
            setDiscussions((prevDiscussions) =>
                page === 0 ? data.content : [...prevDiscussions, ...data.content]
            );

            setTotalPages(data.totalPages);
            setCurrentPage(page);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching discussions:", error);
            setIsLoading(false);
        }
    };

    const fetchAnswer = async (discussionId) => {
        try {
            const answerResponse = await fetch(`${urlApi}/api/discussions/${discussionId}/answers?page=0`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            const dataAns = await answerResponse.json();
            setAnswers(dataAns.content)
        } catch (error) {
            console.error("Error fetching Answers:", error);
        }
    }

    const fetchRecentPosts = async (discussionId) => {
        try {
            const response = await fetch(`${urlApi}/api/discussions`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setRecentPosts(data.content);

        } catch (error) {
            console.error("Error fetching recent posts:", error);
        }
    };

    const handleVote = async (discussionId, voteType) => {
        // Lưu trạng thái ban đầu
        const prevDiscussions = [...discussions];

        // Cập nhật state trước
        setDiscussions((prevDiscussions) =>
            prevDiscussions.map((discussion) =>
                discussion.discussionId === discussionId
                    ? {
                        ...discussion,
                        voteDTO: {
                            ...discussion.voteDTO,
                            upVotes:
                                voteType === "UP"
                                    ? discussion.voteDTO.upVotes + 1
                                    : discussion.voteDTO.upVotes,
                            downVotes:
                                voteType === "DOWN"
                                    ? discussion.voteDTO.downVotes + 1
                                    : discussion.voteDTO.downVotes,
                        },
                    }
                    : discussion
            )
        );

        // Gửi yêu cầu API
        try {
            const formData = new FormData();
            formData.append("voteType", voteType);

            const response = await fetch(`${urlApi}/api/discussions/${discussionId}/votes`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                // Nếu lỗi, khôi phục trạng thái ban đầu
                setDiscussions(prevDiscussions);

                fetchDiscussionDetails(discussionId);
            }
        } catch (error) {
            console.error("Error during voting:", error);
            // Khôi phục trạng thái nếu lỗi
            setDiscussions(prevDiscussions);
        }
    };




    const fetchDiscussionDetails = async (discussionId) => {
        try {
            const response = await fetch(`${urlApi}/api/discussions/${discussionId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setSelectedDiscussion(data);

            setCurrentId(discussionId);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching discussion details:", error);
        }
    };

    const handleAnswerVote = async (answerId, voteType) => {
        // Cập nhật trước vào state
        setAnswers((prevAnswers) =>
            prevAnswers.map((answer) =>
                answer.answerId === answerId
                    ? {
                        ...answer,
                        voteDTO: {
                            ...answer.voteDTO,
                            upVotes:
                                voteType === "UP"
                                    ? answer.voteDTO.upVotes + 1
                                    : answer.voteDTO.upVotes,
                            downVotes:
                                voteType === "DOWN"
                                    ? answer.voteDTO.downVotes + 1
                                    : answer.voteDTO.downVotes,
                        },
                    }
                    : answer
            )
        );

        // Sau đó gửi yêu cầu API
        try {
            const formData = new FormData();
            formData.append("voteType", voteType);

            const response = await fetch(`${urlApi}/api/answers/${answerId}/votes`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                console.error("Failed to vote on answer");
            }
        } catch (error) {
            console.error("Error during voting on answer:", error);
        }
    };

    useEffect(() => {
        fetchDiscussions(0);
    }, []);

    const handleScroll = () => {
        if (
            window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - 100 &&
            !isLoading &&
            currentPage + 1 < totalPages
        ) {
            fetchDiscussions(currentPage + 1);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [currentPage, isLoading, totalPages]);

    console.log(answers)

    return (
        <div className={cx("container")}>
            <div className={cx("functions")}>

            </div>
            <div className={cx("discussion-layout")}>
                <div className={cx("discussion-list")}>
                    <div className={cx("discussion-all")}>
                        {discussions.map((discussion) => (
                            discussion.discussionStatus === "APPROVED" && <div key={discussion.discussionId} className={cx("discussion-item")}>
                                <div className={cx("discussion-point")}>
                                    <div className={cx("votes")}>
                                        {discussion.voteDTO.upVotes + discussion.voteDTO.downVotes} votes
                                    </div>
                                    <div className={cx("answer")}>
                                        {discussion.answerQuantity} Answers
                                    </div>
                                    <div className={cx("point")}>
                                        {discussion.voteDTO.upVotes - discussion.voteDTO.downVotes} score
                                    </div>
                                </div>
                                <div className={cx("discussion-info")}>

                                    <div className={cx("discussion-title")} onClick={() => fetchDiscussionDetails(discussion.discussionId)}>{discussion.title}</div>
                                    <div className={cx("discussion-content")}>{discussion.content}</div>
                                    <div className={cx("discussion-header")}>
                                        <span className={cx("discussion-author")}>
                                            <img src={"http://localhost:8084" + discussion.author_DTO.avaFileCode}></img>
                                            {discussion.author_DTO.name} asked at
                                            <span>{discussion.createAt.split('-').reverse().join('/')}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {isLoading && <div className={cx("loading")}>Loading...</div>}
                    {currentPage + 1 >= totalPages && (
                        <div className={cx("no-more")}>No more discussions</div>
                    )}
                </div>

            </div>

            {isModalOpen && selectedDiscussion && (
                <div className={cx("modal")}>
                    <div className={cx("modal-content")}>
                        <span className={cx("close-button")} onClick={() => setIsModalOpen(false)}>
                            &times;
                        </span>
                        <div className={cx("vote")}>
                            <i
                                className="fa-solid fa-caret-up"
                                onClick={() => handleVote(selectedDiscussion.discussionId, "UP")}
                            ></i>
                            <span>{selectedDiscussion.voteDTO.upVotes - selectedDiscussion.voteDTO.downVotes}</span>
                            <i
                                className="fa-solid fa-caret-down"
                                onClick={() => handleVote(selectedDiscussion.discussionId, "DOWN")}
                            ></i>
                        </div>

                        <div className={cx("content")}>
                            <div className={cx("author-info")}>
                                <img
                                    src={`${urlApi}${selectedDiscussion.author.avaFileCode}`}
                                    alt={selectedDiscussion.author.name}
                                    className={cx("author-avatar")}
                                />
                                <div className={cx("author-details")}>
                                    <strong>{selectedDiscussion.author.name}</strong>
                                    <p>{new Date(selectedDiscussion.createAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <h2>{selectedDiscussion.title}</h2>
                            <p>{selectedDiscussion.content}</p>
                            {selectedDiscussion.tagDTOList.map((tag) => (
                                <span className={cx("tag")}>{tag.tagName}</span>
                            ))
                            }
                            <div className={cx("answer")}>
                                <div className={cx("line")}></div>
                                <button onClick={() => fetchAnswer(currentId)}>Show Answers</button>
                                <div className={cx("answer-content")}>
                                    {answers.map((answer) =>
                                    (<div className={cx("answer-item")}>
                                        <div className={cx("vote")}>
                                            <i
                                                className="fa-solid fa-caret-up"
                                                onClick={() => handleAnswerVote(answer.answerId, "UP")}
                                            ></i>
                                            <span>{answer.voteDTO.upVotes - answer.voteDTO.downVotes}</span>
                                            <i
                                                className="fa-solid fa-caret-down"
                                                onClick={() => handleAnswerVote(answer.answerId, "DOWN")}
                                            ></i>
                                        </div>
                                        <div>
                                            <div className={cx("answer-author")}>
                                                <img src={urlApi + answer.author.avaFileCode} alt=""></img>
                                                <p>{answer.author.name}</p>
                                            </div>
                                            <div className={cx("answer-content")}>{answer.content}</div>
                                        </div>
                                    </div>
                                    )
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Forum;
