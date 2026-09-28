// =========================================
// PORTFOLIO SCRIPT
// =========================================


// -----------------------------------------
// CURRENT YEAR
// -----------------------------------------

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


// -----------------------------------------
// SMOOTH SCROLLING
// -----------------------------------------

const navigationLinks =
    document.querySelectorAll('a[href^="#"]');

navigationLinks.forEach(link => {

    link.addEventListener("click", function (event) {

        const targetId = this.getAttribute("href");

        // Ignore empty "#" links
        if (targetId === "#") {
            event.preventDefault();
            return;
        }

        const target = document.querySelector(targetId);

        if (target) {

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

});


// -----------------------------------------
// NAVBAR ON SCROLL
// -----------------------------------------

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (!navbar) return;

    if (window.scrollY > 30) {

        navbar.style.borderBottom =
            "1px solid #d7d7d3";

    } else {

        navbar.style.borderBottom = "none";

    }

});


// -----------------------------------------
// MORE PROJECTS
// -----------------------------------------

const moreProjectsBtn =
    document.getElementById("moreProjectsBtn");

const extraProjects =
    document.getElementById("extraProjects");

if (moreProjectsBtn && extraProjects) {

    moreProjectsBtn.addEventListener(
        "click",
        function () {

            extraProjects.classList.toggle("show");

            if (extraProjects.classList.contains("show")) {

                moreProjectsBtn.textContent =
                    "Show Less ↑";

            } else {

                moreProjectsBtn.textContent =
                    "More Projects ↓";

            }

        }
    );

}


// -----------------------------------------
// MORE CERTIFICATIONS
// -----------------------------------------

const moreCertificationsBtn =
    document.getElementById("moreCertificationsBtn");

const extraCertifications =
    document.getElementById("extraCertifications");

if (moreCertificationsBtn && extraCertifications) {

    moreCertificationsBtn.addEventListener(
        "click",
        function () {

            extraCertifications.classList.toggle("show");

            if (
                extraCertifications.classList.contains("show")
            ) {

                moreCertificationsBtn.textContent =
                    "Show Less ↑";

            } else {

                moreCertificationsBtn.textContent =
                    "More Certifications ↓";

            }

        }
    );

}


// =========================================
// EXPLORE — ASK ME
// =========================================

const askButton =
    document.getElementById("askButton");

const questionForm =
    document.getElementById("questionForm");

if (askButton && questionForm) {

    askButton.addEventListener(
        "click",
        function () {

            questionForm.classList.toggle("show");

            if (questionForm.classList.contains("show")) {

                askButton.textContent =
                    "Close ↑";

            } else {

                askButton.textContent =
                    "Ask me something ↗";

            }

        }
    );

}


// =========================================
// EXPLORE — SUBMIT QUESTION
// =========================================

const submitQuestion =
    document.getElementById("submitQuestion");

const questionInput =
    document.getElementById("question");

const questionEmail =
    document.getElementById("questionEmail");

if (
    submitQuestion &&
    questionInput &&
    questionEmail
) {

    submitQuestion.addEventListener(
        "click",
        async function () {

            const question =
                questionInput.value.trim();

            const email =
                questionEmail.value.trim();


            // Check if question is empty
            if (!question) {

                questionInput.focus();

                return;

            }


            // Disable button while sending
            submitQuestion.disabled = true;

            submitQuestion.textContent =
                "Sending...";


            try {

                const response = await fetch(
                    "http://127.0.0.1:8000/api/questions",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            question: question,
                            email: email || null
                        })
                    }
                );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Something went wrong"
                    );

                }


                // Success
                questionInput.value = "";
                questionEmail.value = "";

                submitQuestion.textContent =
                    "Question sent ✓";


                setTimeout(() => {

                    submitQuestion.textContent =
                        "Send question →";

                }, 2500);


            } catch (error) {

                console.error(
                    "Question submission error:",
                    error
                );

                submitQuestion.textContent =
                    "Try again →";

            } finally {

                submitQuestion.disabled = false;

            }

        }
    );

}


// =========================================
// EXPLORE — PREVIOUS QUERIES
// =========================================

const previousQueriesBtn =
    document.getElementById("previousQueriesBtn");

const answeredQuestions =
    document.getElementById("answeredQuestions");


if (previousQueriesBtn && answeredQuestions) {

    previousQueriesBtn.addEventListener(
        "click",
        async function () {


            // Already open → close it
            if (
                answeredQuestions.classList.contains("show")
            ) {

                answeredQuestions.classList.remove("show");

                previousQueriesBtn.textContent =
                    "Previous Queries ↓";

                return;

            }


            // Open it
            answeredQuestions.classList.add("show");

            previousQueriesBtn.textContent =
                "Previous Queries ↑";


            await loadAnsweredQuestions();

        }
    );

}


// =========================================
// LOAD ANSWERED QUESTIONS
// =========================================

async function loadAnsweredQuestions() {

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/questions/answered"
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.detail ||
                "Could not load previous queries"
            );

        }


        renderAnsweredQuestions(data.data);


    } catch (error) {

        console.error(
            "Previous queries error:",
            error
        );


        answeredQuestions.innerHTML = `
            <p class="error">
                Could not load previous queries.
            </p>
        `;

    }

}


// =========================================
// RENDER ANSWERED QUESTIONS
// =========================================

function renderAnsweredQuestions(questions) {

    answeredQuestions.innerHTML = "";


    if (!questions || questions.length === 0) {

        answeredQuestions.innerHTML = `
            <p class="error">
                No answered questions yet.
            </p>
        `;

        return;

    }


    questions.forEach(function (item) {

        const questionElement =
            document.createElement("div");


        questionElement.className =
            "explore-question";


        questionElement.innerHTML = `

            <div class="explore-question-label">
                Q.
            </div>

            <h3>
                ${escapeHTML(item.question)}
            </h3>

            <div class="explore-answer">

                <span class="explore-answer-label">
                    A.
                </span>

                ${escapeHTML(item.answer || "")}

            </div>

        `;


        answeredQuestions.appendChild(
            questionElement
        );

    });

}


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}