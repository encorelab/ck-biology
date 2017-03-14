Skeletor.Mobile.clinicReport = {
  "parts": [
    {
      "number": 1,
      "kind": "write",
      "thumbnail": "",
      "question": `
        <h2>Question 1</h2>
        <p class="immunologist">Immunologist:  Based on your reading from Review Part 1, which of the patient's symptoms (if any) are consistent with systemic lupus erythematosus?</p>
        <p class="immunologist clinic-answer"></p>
        <p class="endocrinologist">Endocrinologist:  Based on your reading from Review Part 1, which of the patient's symptoms (if any) are consistent with Grave's disease?</p>
        <p class="endocrinologist clinic-answer"></p>
        <p class="nephrologist">Nephrologist:  Based on your reading from Review Part 1, which of the patient's symptoms (if any) are consistent with Glomerulonephritis?</p>
        <p class="nephrologist clinic-answer"></p>
        <p class="neurologist">Neurologist:  Based on your reading from Review Part 1, which of the patient's symptoms (if any) are consistent with NPSLE?</p>
        <p class="neurologist clinic-answer"></p>
      `,
      "html": `
        <h2>Introduction</h2>
        <ul>You are a team of medical practitioners with diverse specializations who have joined together to start your own medical clinic.  A 20-year-old female patient arrives at your clinic with the following symptoms:
          <li>Fatigue</li>
          <li>Trouble sleeping</li>
          <li>Headaches</li>
          <li>High blood pressure</li>
          <li>Anxiety and irritability</li>
          <li>Confusion and memory loss</li>
        </ul>
        <p>Working as a team, your task is to further examine this patient and arrive at a proper diagnosis for her condition.  You will then explain your diagnosis (and possible treatment options) to her family.<p>
        <br />
        <h2>Question 1</h2>
        <p class="immunologist">Immunologist:  Based on your reading from Review Part 1, which of the patient's symptoms (if any) are consistent with systemic lupus erythematosus?</p>
        <textarea class="immunologist" placeholder="Enter your text here"></textarea>
        <img class="conference-btn" src="/reports/imgs/conference_icon.png"></img>
        <span class="conference-text">call a conference</span>
        <button class="clinic-save-btn">save respnse</button>
        <p class="endocrinologist">Endocrinologist:  Based on your reading from Review Part 1, which of the patient's symptoms (if any) are consistent with Grave's disease?</p>
        <textarea class="endocrinologist" placeholder="Enter your text here"></textarea>
        <img class="conference-btn" src="/reports/imgs/conference_icon.png"></img>
        <span class="conference-text">call a conference</span>
        <button class="clinic-save-btn">save respnse</button>
        <p class="nephrologist">Nephrologist:  Based on your reading from Review Part 1, which of the patient's symptoms (if any) are consistent with Glomerulonephritis?</p>
        <textarea class="nephrologist" placeholder="Enter your text here"></textarea>
        <img class="conference-btn" src="/reports/imgs/conference_icon.png"></img>
        <span class="conference-text">call a conference</span>
        <button class="clinic-save-btn">save respnse</button>
        <p class="neurologist">Neurologist:  Based on your reading from Review Part 1, which of the patient's symptoms (if any) are consistent with NPSLE?</p>
        <textarea class="neurologist" placeholder="Enter your text here"></textarea>
        <img class="conference-btn" src="/reports/imgs/conference_icon.png"></img>
        <span class="conference-text">call a conference</span>
        <button class="clinic-save-btn">save respnse</button>
        `
    },
    {
      "number": 2,
      "kind": "write",
      "thumbnail": "",
      "question": `
        <h2>Question 2</h2>
        <p class="immunologist">Immunologist:  If this patient has systemic lupus erythematosus, what would you expect to see in the results of the blood ANA test?</p>
        <p class="immunologist clinic-answer"></p>
        <p class="endocrinologist">Endocrinologist:  If this patient has Grave's disease, what would you expect to see in the results of the blood thyroid function test?</p>
        <p class="endocrinologist clinic-answer"></p>
        <p class="nephrologist">Nephrologist:  If this patient has glomerulonephritis, what would you expect to see in the results of the urinalysis and urine microscopy?</p>
        <p class="nephrologist clinic-answer"></p>
        <p class="neurologist">Neurologist:  If this patient has NPSLE, what might you see in the results of the EEG?</p>
        <p class="neurologist clinic-answer"></p>
      `,
      "html": `
        <h2>Question 2</h2>
        <ul>To assist you in identifying this patient's condition, you decide to order the following tests:
          <li>Immunologist - Blood ANA test</li>
          <li>Endocrinologist - Blood thyroid function test</li>
          <li>Nephrologist - Urinalysis and urine microscopy</li>
          <li>Neurologist - EEG</li>
        </ul>
        <p class="immunologist">Immunologist:  If this patient has systemic lupus erythematosus, what would you expect to see in the results of the blood ANA test?</p>
        <textarea class="immunologist" placeholder="Enter your text here"></textarea>
        <img class="conference-btn" src="/reports/imgs/conference_icon.png"></img>
        <span class="conference-text">call a conference</span>
        <button class="clinic-save-btn">save respnse</button>
        <p class="endocrinologist">Endocrinologist:  If this patient has Grave's disease, what would you expect to see in the results of the blood thyroid function test?</p>
        <textarea class="endocrinologist" placeholder="Enter your text here"></textarea>
        <img class="conference-btn" src="/reports/imgs/conference_icon.png"></img>
        <span class="conference-text">call a conference</span>
        <button class="clinic-save-btn">save respnse</button>
        <p class="nephrologist">Nephrologist:  If this patient has glomerulonephritis, what would you expect to see in the results of the urinalysis and urine microscopy?</p>
        <textarea class="nephrologist" placeholder="Enter your text here"></textarea>
        <img class="conference-btn" src="/reports/imgs/conference_icon.png"></img>
        <span class="conference-text">call a conference</span>
        <button class="clinic-save-btn">save respnse</button>
        <p class="neurologist">Neurologist:  If this patient has NPSLE, what might you see in the results of the EEG?</p>
        <textarea class="neurologist" placeholder="Enter your text here"></textarea>
        <img class="conference-btn" src="/reports/imgs/conference_icon.png"></img>
        <span class="conference-text">call a conference</span>
        <button class="clinic-save-btn">save respnse</button>
        `
    },
    {
      "number": 3,
      "kind": "write",
      "thumbnail": "",
      "question": `
        <h2>Question 3</h2>
        <p class="immunologist">Immunologist:  Based on the results of the blood ANA test, what is your diagnosis for this patient?</p>
        <p class="immunologist clinic-answer"></p>
        <p class="endocrinologist">Endocrinologist:  Based on the results of the blood thyroid function test, what is your diagnosis for this patient?</p>
        <p class="endocrinologist clinic-answer"></p>
        <p class="nephrologist">Nephrologist:  Based on the results of the urinalysis and urine microscopy, what is your diagnosis for this patient?</p>
        <p class="nephrologist clinic-answer"></p>
        <p class="neurologist">Neurologist:  Based on the results of the EEG, is it possible that this patient may have NPSLE?</p>
        <p class="neurologist clinic-answer"></p>
      `,
      "html": `
        <h2>Question 3</h2>
        <p>Your lab tests are ready!  Please pick up your results from Dr. Nino.</p>
        <p class="immunologist">Immunologist:  Based on the results of the blood ANA test, what is your diagnosis for this patient?</p>
        <textarea class="immunologist" placeholder="Enter your text here"></textarea>
        <img class="conference-btn" src="/reports/imgs/conference_icon.png"></img>
        <span class="conference-text">call a conference</span>
        <button class="clinic-save-btn">save respnse</button>
        <p class="endocrinologist">Endocrinologist:  Based on the results of the blood thyroid function test, what is your diagnosis for this patient?</p>
        <textarea class="endocrinologist" placeholder="Enter your text here"></textarea>
        <img class="conference-btn" src="/reports/imgs/conference_icon.png"></img>
        <span class="conference-text">call a conference</span>
        <button class="clinic-save-btn">save respnse</button>
        <p class="nephrologist">Nephrologist:  Based on the results of the urinalysis and urine microscopy, what is your diagnosis for this patient?</p>
        <textarea class="nephrologist" placeholder="Enter your text here"></textarea>
        <img class="conference-btn" src="/reports/imgs/conference_icon.png"></img>
        <span class="conference-text">call a conference</span>
        <button class="clinic-save-btn">save respnse</button>
        <p class="neurologist">Neurologist:  Based on the results of the EEG, is it possible that this patient may have NPSLE?</p>
        <textarea class="neurologist" placeholder="Enter your text here"></textarea>
        <img class="conference-btn" src="/reports/imgs/conference_icon.png"></img>
        <span class="conference-text">call a conference</span>
        <button class="clinic-save-btn">save respnse</button>
        `
    },
    {
      "number": 4,
      "kind": "write",
      "thumbnail": "/reports/imgs/final_report_question4.jpg",
      "question": `
        <h2>Question 4</h2>
        <p>Systemic Lupus Erythematosus (SLE or "lupus") is an autoimmune disease characterized by the presence of large amounts of circulating autoantibodies (i.e. antibodies that bind to self-antigens). An increased number of antibody-producing B cells is observed in lupus patients, as well as impaired T cell activation and increased apoptosis (cell death) of cytotoxic T cells. Explain how/why a patient with SLE may also be experiencing Grave's disease. In your answer, explain the connection between the functions of the immune system and the thyroid.</p>
        <p>Explain how/why a patient with SLE may also be experiencing Grave's disease.  In your answer, explain the connection between the functions of the immune system and the thyroid.</p>
        <p class="clinic-answer"></p>
        <p>Explain how/why a patient with SLE may also be experiencing glomerulonephritis.  In your answer, explain the connection between the functions of the immune system and the kidneys.</p>
        <p class="clinic-answer"></p>
        <p>Explain how/why a patient with SLE may also be experiencing NPSLE.  In your answer, explain the connection between the functions of the immune system and the nervous system.</p>
        <p class="clinic-answer"></p>
      `,
      "html": `
        <h2>Question 4</h2>
        <p>Systemic Lupus Erythematosus (SLE or "lupus") is an autoimmune disease characterized by the presence of large amounts of circulating autoantibodies (i.e. antibodies that bind to self-antigens). An increased number of antibody-producing B cells is observed in lupus patients, as well as impaired T cell activation and increased apoptosis (cell death) of cytotoxic T cells. Explain how/why a patient with SLE may also be experiencing Grave's disease. In your answer, explain the connection between the functions of the immune system and the thyroid.</p>
        <img src="/reports/imgs/final_report_question4.jpg"></img>
        <p>Explain how/why a patient with SLE may also be experiencing Grave's disease.  In your answer, explain the connection between the functions of the immune system and the thyroid.</p>
        <textarea placeholder="Enter your text here"></textarea>
        <button class="clinic-save-btn">save respnse</button>
        <p>Explain how/why a patient with SLE may also be experiencing glomerulonephritis.  In your answer, explain the connection between the functions of the immune system and the kidneys.</p>
        <textarea placeholder="Enter your text here"></textarea>
        <button class="clinic-save-btn">save respnse</button>
        <p>Explain how/why a patient with SLE may also be experiencing NPSLE.  In your answer, explain the connection between the functions of the immune system and the nervous system.</p>
        <textarea placeholder="Enter your text here"></textarea>
        <button class="clinic-save-btn">save respnse</button>
      `
    },
    {
      "number": 5,
      "kind": "write",
      "thumbnail": "",
      "question": `
        <h2>Question 5</h2>
      `,
      "html": `
        <h2>Question 5</h2>
        <p>Your patient's family is currently overseas.  Your patient ("Jane") has asked if you would be willing to share your diagnosis to her family in the form of a video message.</p>
        <p>Use the camera app on the designated iPad at your table to record your video message to Sally's family.  In your message, include your diagnosis as well as the implications of this diagnosis to each of Sally's systems (i.e. immune system, endocrine system, nervous system, and kidneys).  You may optionally discuss possible treatment options (drawing on your readings from Review Part 1).</p>
        <p><i>[Please note:  While this video will be kept confidential, only those group members who have granted video permissions to OISE/UofT should be included in the video].</i></p>
      `
    }
  ]
}
