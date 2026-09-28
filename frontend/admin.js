// =========================================
// ADMIN QUESTIONS
// =========================================

const API_URL = "http://127.0.0.1:8000";

let adminPassword = "";


// =========================================
// ELEMENTS
// =========================================

const loginBox = document.getElementById("loginBox");
const adminPasswordInput =
    document.getElementById("adminPassword");

const loginBtn =
    document.getElementById("loginBtn");

const loginMessage =
    document.getElementById("loginMessage");

const loadQuestionsBtn =
    document.getElementById("loadQuestionsBtn");

const questionsContainer =
    document.getElementById("questionsContainer");


// =========================================
// LOGIN
// =========================================

loginBtn.addEventListener("click", async function () {

    const password = adminPasswordInput.value.trim();

    if (!password) {
        loginMessage.textContent = "Enter admin password.";
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Checking...";

    try {

        const response = await fetch(
            `${API_URL}/api/admin/questions`,
            {
                method: "GET",
                headers: {
                    "X-Admin-Password": password
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Invalid admin password"
            );
        }

        adminPassword = password;

        loginBox.style.display = "none";

        renderQuestions(data.data);

    } catch (error) {

        console.error(error);

        loginMessage.textContent = error.message;

    } finally {

        loginBtn.disabled = false;
        loginBtn.textContent = "Enter →";

    }
});


// =========================================
// LOAD QUESTIONS
// =========================================

async function loadQuestions() {

    if (!adminPassword) {
        return;
    }

    loadQuestionsBtn.disabled = true;
    loadQuestionsBtn.textContent = "Loading...";

    try {

        const response = await fetch(
            `${API_URL}/api/admin/questions`,
            {
                method: "GET",
                headers: {
                    "X-Admin-Password": adminPassword
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Could not load questions"
            );
        }

        renderQuestions(data.data);

    } catch (error) {

        console.error(error);

        questionsContainer.innerHTML = `
            <p class="error">
                ${escapeHTML(error.message)}
            </p>
        `;

    } finally {

        loadQuestionsBtn.disabled = false;
        loadQuestionsBtn.textContent = "Refresh ↻";

    }
}


// =========================================
// RENDER QUESTIONS
// =========================================

function renderQuestions(questions) {

    questionsContainer.innerHTML = "";

    if (!questions || questions.length === 0) {

        questionsContainer.innerHTML = `
            <p class="error">
                No questions yet.
            </p>
        `;

        return;
    }


    questions.forEach(function (question) {

        const card = document.createElement("div");

        card.className = "question-card";


        const createdDate = new Date(
            question.created_at
        ).toLocaleString();


        // =====================================
        // PENDING QUESTION
        // =====================================

        const status = String(question.status || "")
            .replace(/'/g, "")
            .trim()
            .toLowerCase();

        if (status === "pending") {

            card.innerHTML = `

                <div class="question-meta">
                    <span>#${question.id}</span>
                    <span>${escapeHTML(question.status)}</span>
                </div>

                <div class="question-text">
                    ${escapeHTML(question.question)}
                </div>

                ${
                    question.email
                        ? `
                            <div class="question-email">
                                ${escapeHTML(question.email)}
                            </div>
                          `
                        : ""
                }

                <div class="question-date">
                    ${escapeHTML(createdDate)}
                </div>

                <textarea
                    class="answer-box"
                    placeholder="Write your answer..."
                ></textarea>

                <button
                    type="button"
                    class="answer-btn"
                >
                    Answer →
                </button>
            `;


            const answerBox =
                card.querySelector(".answer-box");

            const answerButton =
                card.querySelector(".answer-btn");


            answerButton.addEventListener(
                "click",
                function () {

                    answerQuestion(
                        question.id,
                        answerBox,
                        answerButton
                    );

                }
            );

        }


        // =====================================
        // ANSWERED QUESTION
        // =====================================

        else {

            card.innerHTML = `

                <div class="question-meta">
                    <span>#${question.id}</span>
                    <span>${escapeHTML(question.status)}</span>
                </div>

                <div class="question-text">
                    ${escapeHTML(question.question)}
                </div>

                ${
                    question.email
                        ? `
                            <div class="question-email">
                                ${escapeHTML(question.email)}
                            </div>
                          `
                        : ""
                }

                <div class="answered">

                    <strong>Answer</strong>

                    <p>
                        ${escapeHTML(question.answer || "")}
                    </p>

                </div>
            `;

        }


        questionsContainer.appendChild(card);

    });
}


// =========================================
// ANSWER QUESTION
// =========================================

async function answerQuestion(
    questionId,
    answerBox,
    answerButton
) {

    const answer = answerBox.value.trim();

    if (!answer) {

        answerBox.focus();

        return;
    }


    answerButton.disabled = true;
    answerButton.textContent = "Saving...";


    try {

        const response = await fetch(
            `${API_URL}/api/admin/questions/${questionId}`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Password": adminPassword
                },

                body: JSON.stringify({
                    answer: answer
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail || "Could not save answer"
            );

        }


        answerButton.textContent = "Answered ✓";


        setTimeout(function () {
            loadQuestions();
        }, 500);


    } catch (error) {

        console.error(error);

        answerButton.disabled = false;
        answerButton.textContent = "Try again →";

    }

}


// =========================================
// REFRESH
// =========================================

loadQuestionsBtn.addEventListener(
    "click",
    loadQuestions
);


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}