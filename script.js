let currentQuestion = 0;
let correctAnswers = 0;
let quiz = [];

const renderQuiz = () => {
    const quizContainer = document.getElementById('quiz');
    let output = '';

    quiz.forEach((question, index) => {
        if (index < 10) { // limit to 10 random questions
            const answers = Object.entries(question.answers)
                .map(([letter, answer]) => `
            <label>
              <input type="radio" name="question${index}" value="${letter}">
              ${letter}: ${answer}
            </label>
          `)
                .join('');

            output += `
          <div class="question">${question.question}</div>
          <div class="answers">${answers}</div>
        `;
        }
    });

    quizContainer.innerHTML = output;
};

const submitQuiz = () => {
    const quizContainer = document.getElementById('quiz');
    const answerContainers = quizContainer.querySelectorAll('.answers');
    let userAnswer;
    let numCorrect = 0;

    quiz.forEach((question, index) => {
        if (index < 10) { // limit to 10 random questions
            userAnswer = (answerContainers[index].querySelector(`input[name="question${index}"]:checked`) || {}).value;

            if (userAnswer === question.correctAnswer) {
                numCorrect++;
                answerContainers[index].style.color = 'lightgreen';
            } else {
                answerContainers[index].style.color = 'red';
            }
        }
    });

    document.getElementById('result').innerHTML = `${numCorrect} out of ${Math.min(quiz.length, 10)} correct <br><br>
    <h4>Best of Luck</h3><br><br><h6>By Koustubh Dave</h6><br><br><br><br><p>I you want to promote yourself here, First follow me on insta <a href="https://www.instagram.com/koustubh12345g/">@kouatubh12345g</a><br>Thank You</p>`;
    document.getElementById('result').style.display = 'block';
    document.getElementById('quiz').style.display = 'none';
    document.getElementById('submit').style.display = 'none';
    document.getElementById('retry').style.display = 'inline-block';
    document.getElementById('random').style.display = 'inline-block';
};

const retryQuiz = () => {
    currentQuestion = 0;
    correctAnswers = 0;
    document.getElementById('result').style.display = 'none';
    document.getElementById('quiz').style.display = 'block';
    document.getElementById('submit').style.display = 'inline-block';
    document.getElementById('retry').style.display = 'none';
    document.getElementById('random').style.display = 'none';
    renderQuiz();
};

const getRandomQuiz = () => {
    quiz.sort(() => Math.random() - 0.5);
    renderQuiz();
};

fetch('quiz.json')
    .then(response => response.json())
    .then(data => {
        quiz = data;
        renderQuiz();
        console.log(quiz); // check if quiz data is loaded correctly
    })
    .catch(error => {
        console.error('Error loading quiz data:', error);
        document.getElementById('quiz').innerHTML = 'Error loading quiz data. Please try again later.';
    });

document.getElementById('submit').addEventListener('click', submitQuiz);
document.getElementById('retry').addEventListener('click', retryQuiz);
document.getElementById('random').addEventListener('click', getRandomQuiz);
