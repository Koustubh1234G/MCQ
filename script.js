class QAHandler {
    constructor() {
        this.quiz = [];
    }

    loadQuiz() {
        return new Promise((resolve, reject) => {
            fetch('CompElementry.json')
            .then(response => response.json())
            .then(data => {
                this.quiz = data;
                resolve(data);
            })
            .catch(error => {
                reject(error);
            });
        });
    }

    calculateScore(quiz, userAnswers) {
        let correctAnswers = 0;
        quiz.forEach((question, index) => {
            if(userAnswers[index] === question.correctAnswer) {
                correctAnswers++;
            }
        });
        return correctAnswers;
    }

    shuffleQuiz() {
        // Check if quiz is available
        if (!this.quiz) {
            throw new Error('Quiz data is not available.');
        }
        // Shuffle the quiz array using Fisher-Yates algorithm
        const shuffledQuiz = [...this.quiz];
        for (let i = shuffledQuiz.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledQuiz[i], shuffledQuiz[j]] = [shuffledQuiz[j], shuffledQuiz[i]];
        }
        // Select only the first 10 questions
        const selectedQuestions = shuffledQuiz.slice(0, 10);
        return selectedQuestions;
    }
    

}

class UIHandler {
    constructor() {
        this.quizContainer = document.getElementById('quiz');
        this.resultContainer = document.getElementById('result');
        this.playButton = document.getElementById('play');
        this.submitButton = document.getElementById('submit');
        this.retryButton = document.getElementById('retry');
        this.randomButton = document.getElementById('random');
    }

    renderQuiz(quiz) {
        let output = '';

        quiz.forEach((question, index) => {
            const answers = Object.entries(question.answers)
                .map(([letter, answer]) => `
                    <label>
                        <input type="radio" name="question${index}" value="${letter}">
                        ${letter}: ${answer}
                    </label>
                `)
                .join('');
            output += `<div class="card">
                <div class="question">${question.question}</div>
                <div class="answers">${answers}</div>
                </div>
            `;
        });

        this.quizContainer.innerHTML = output;
        this.resultContainer.innerHTML = ''; // clear previos result
    }

    showResult(score, totalQuestions) {
        const percentage = (score / totalQuestions) * 100;
        const message = `<p>You scored ${score} out of ${totalQuestions} (${percentage}%)</p>`;
        this.resultContainer.innerHTML = message;
    }

    showError(message) {
        const errorMessage = `<p class="error">${message}</p>`;
        this.resultContainer.innerHTML = errorMessage;
    }

    resetQuiz() {
        // Clear quiz container
        this.quizContainer.innerHTML = '';

        // Hide result container
        this.resultContainer.style.display = 'none';

        // Show play button and hide other buttons
        this.playButton.style.display = 'inline-block';
        this.submitButton.style.display = 'none';
        this.retryButton.style.display = 'none';
        this.randomButton.style.display = 'none';
    }

    bindPlay(callback) {
        this.playButton.addEventListener('click', callback);
    }

    bindSubmit(callback) {
        this.submitButton.addEventListener('click', callback);
    }

    bindRetry(callback) {
        this.retryButton.addEventListener('click', callback);
    }
    bindRandom(callback) {
        this.randomButton.addEventListener('click', callback);
    }

    getUserAnswers() {
        const userAnswers = [];
        const questions = this.quizContainer.querySelectorAll('.question');

        questions.forEach((question, index) => {
            const selectedOption = this.quizContainer.querySelector(`input[name="question${index}"]:checked`);
            if (selectedOption) {
                userAnswers.push(selectedOption.value);
            }
            else {
                userAnswers.push(null);
            }
        });

        return userAnswers;
    }
}

class FormHandler {
    constructor() {
        this.form = document.querySelector('form');
        this.nameInput = this.form.querySelector('input[name="name"]');
        this.reviewInput = this.form.querySelector('input[name="review"]');
        this.ipInput = document.createElement('input');
        this.ipInput.type = 'hidden';
        this.ipInput.name = 'ip';
        this.form.appendChild(this.ipInput);
    }

    async getIpAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        }
        catch(error) {
            console.error('Error fetching IP Address', error);
            return null;
        }
    }

    async showForm() {
        this.ipInput.value = await this.getIpAddress();
        this.form.style.display = 'block';
    }
    
    hideForm() {
        this.form.style.display = 'none';
    }

    bindFormSubmit(callback) {
        this.form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const userData = {
                name: this.nameInput.value,
                review: this.reviewInput.value,
                ip: this.ipInput.value
            };
            callback(userData);
        });
    }

    submitData(data, score) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('review', data.review);
        formData.append('ip', data.ip);
        formData.append('score', score);

        fetch('https://formspree.io/f/xjvnjdoy', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Form submission successful:', data);
            this.hideForm();
        })
        .catch(error => {
            console.error('Error submitting form:', error);
        });
    }

}

class App {
    constructor() {
        this.currentQuestions = 0;
        this.correctAnswers = 0;
        this.quiz = [];
        this.shuffledQuiz = []; // Store shuffled quiz questions
        this.uiHandler = new UIHandler(); 
        this.qaHandler = new QAHandler();
        this.formHandler = new FormHandler();
        this.initializeApp();
        this.bindEvents();
    }

    initializeApp() {
        this.uiHandler.quizContainer.style.display = 'none';
        this.uiHandler.submitButton.style.display = 'none';
        this.uiHandler.resultContainer.style.display = 'none';
        this.uiHandler.randomButton.style.display = 'none';
        this.uiHandler.retryButton.style.display = 'none';
        this.formHandler.hideForm();
    }

    loadQuiz() {
        this.qaHandler.loadQuiz()
        .then(data => {
            this.quiz = data;
            this.qaHandler.shuffleQuiz(this.quiz); // shuffle all quiz
            const firstTenQuestions = this.quiz.slice(0, 10); // get first 10 questions
            this.renderQuiz(firstTenQuestions);
            this.uiHandler.quizContainer.style.display = 'block';
            this.uiHandler.playButton.style.display = 'none';
            this.uiHandler.submitButton.style.display = 'inline-block';
            this.uiHandler.randomButton.style.display = 'inline-block';
        })
        .catch(error => {
            this.uiHandler.showError("Error loading Quiz data. Contact Koustubh", error);
        });
    }

    renderQuiz(firstTenQuestions) {
        this.uiHandler.renderQuiz(firstTenQuestions);
    }

    submitQuiz() {
        const userAnswers = this.uiHandler.getUserAnswers();
        this.correctAnswers = this.qaHandler.calculateScore(this.quiz, userAnswers);
        this.uiHandler.showResult(this.correctAnswers, 10); // Use the length of the original quiz
        this.uiHandler.quizContainer.style.display = 'none';
        this.uiHandler.resultContainer.style.display = 'block';
        this.formHandler.showForm(); // Show the form
        this.uiHandler.retryButton.style.display = 'block';
        this.uiHandler.submitButton.style.display = 'none';
    }
    

    retryQuiz() {
        this.uiHandler.resetQuiz();
        this.currentQuestions = 0;
        this.correctAnswers = 0;
        this.loadQuiz();
        this.formHandler.hideForm();
    }

    getRandomQuiz() {
        // console.log(this.qaHandler.quiz); // debugging - shows array of question
        const shuffledQuiz = this.qaHandler.shuffleQuiz();
        this.uiHandler.renderQuiz(shuffledQuiz);
    }    

    bindEvents() {
        this.uiHandler.bindPlay(this.loadQuiz.bind(this));
        this.uiHandler.bindSubmit(this.submitQuiz.bind(this));
        this.uiHandler.bindRetry(this.retryQuiz.bind(this));
        this.uiHandler.bindRandom(this.getRandomQuiz.bind(this));
        this.formHandler.bindFormSubmit(this.submitForm.bind(this));
    }

    submitForm(data) {
        this.formHandler.submitData(data, this.correctAnswers);
    }
}

const quizApp = new App();