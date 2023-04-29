fetch('quiz.json')
    .then(response => response.json())
    .then(questions => {
            questions.sort(() => 0.5 - Math.random());
            const quiz = questions.slice(0, 5);

            const questionList = document.getElementById('question-list');
            quiz.forEach((question, index) => {
                        const li = document.createElement('li');
                        li.innerHTML = `
        <h3>${index + 1}. ${question.text}</h3>
        ${question.options.map(option => `
          <input type="radio" name="q${index}" value="${option}">
          <label>${option}</label><br>
        `).join('')}
      `;
      questionList.appendChild(li);
    });

    const submitBtn = document.getElementById('submit-btn');
    const resultText = document.getElementById('result');
    const retryBtn = document.getElementById('retry-btn');
    submitBtn.addEventListener('click', () => {
      let numCorrect = 0;
      quiz.forEach((question, index) => {
        const selectedOption = document.querySelector(`input[name="q${index}"]:checked`);
        if (selectedOption && selectedOption.value === question.answer) {
          numCorrect++;
        }
      });

      const numIncorrect = quiz.length - numCorrect;
      resultText.textContent = `You got ${numCorrect} out of ${quiz.length} questions correct.`;
      retryBtn.style.display = 'block';
    });

    retryBtn.addEventListener('click', () => {
      window.location.reload();
    });
  })
  .catch(error => console.error(error));