Skeletor.Mobile.report = {
  "group_colour": "red",
  "lesson": "review3",
  "parts": [
    {
      "number": 1,
      "kind": "read",
      "name": "Introduction",
      "thumbnail": "",
      "html": `
        <h2>Introduction</h2>
        <p>Cattle farming is a key component of Canadian agriculture. However, approximately 23% of Canada’s methane emissions are from cow burps ("enteric fermentations"). This number is troubling because the Global Warming Potential (GWP) of methane is 21 times that of carbon dioxide on a 100-year time scale (Environmental Protection Agency, 2013). Some progress in methane reduction has been made by scientists who have adjusted the composition of cattle feed (Rathke, 2013), but opportunities exist to pursue more cutting-edge approaches.</p>
        <p>Maria Niño-Soto, a self-made billionaire, has decided to become a leader in the cattle industry by finding ways to make it more environmentally friendly. Towards this end, she has started the Niño-Soto Foundation (NSF) to fund research projects that could provide new solutions to problems in the cattle industry. You have been hired by the NSF as an expert reviewer, tasked with evaluating a research proposal in order to decide if the proposed project is both possible and scientifically sound. As part of your evaluation, you will prepare a report to Maria Niño-Soto in which you explain key elements of the research and comment on its plausibility.</p>`
    },
    {
      "number": 2,
      "kind": "read",
      "name": "Research Proposal",
      "thumbnail": "",
      "html": `
        <h2>Research Proposal</h2>
        <object id="attach-terms-pdf-content" type="application/pdf" data="reports/pdfs/bovine_methane_proposal.pdf?#zoom=60&scrollbar=0&toolbar=0&navpanes=0"><p>PDF cannot be displayed</p></object>`
    },
    {
      "number": 3,
      "kind": "read",
      "name": "The Underlying Science",
      "thumbnail": "",
      "html": `
        <h2>The Underlying Science</h2>
        <p>The enzyme pMMO (particulate methane monooxygenase) is a key part of Dr. Heifer Sutherland’s proposed project, so you will need to understand some basic features of this protein complex and the genes encoding it. You review the literature about pMMO and learn that pMMO is a membrane-bound copper and iron containing enzyme. The structural genes for this enzyme lie in a three-gene operon named <i>pmoCAB</i>. This operon codes for the three integral membrane polypeptides: PmoC, PmoA and PmoB of approximately 23, 27, and 45 kDa, respectively, that make up the final functional enzyme pMMO (McDonald et al., 2008).</p>
        <p>It is really important that the NSF understands that the genes contain all the information necessary for a cell to produce methane monooxygenase. You decide that your report to the NSF should contain the answers to the following specific questions in order to be able to understand the proposed project and to be able to address questions surrounding its feasibility.</p>`
    },
    {
      "number": 4,
      "kind": "write",
      "name": "Step 1: Representation of the pmoCAB Operon",
      "thumbnail": "reports/imgs/pmo_genes.png",
      "html": `
        <h2>Step 1: Representation of the <i>pmoCAB</i> Operon</h2>
        <p>Which diagram would you choose as the most useful and accurate depiction of the arrangement of the genes in the chromosome of <i>M. capsulatus</i>? In the text box below, indicate the letter of your chosen diagram and give reasons to support your choice.</p>
        <img src="reports/imgs/pmo_genes.png"></img>
        <textarea placeholder="Enter your text here"></textarea>`
    },
    {
      "number": 5,
      "kind": "write",
      "name": "Step 2: Explanation of Gene Sequences for Transcription and Translation",
      "thumbnail": "",
      "html": `
        <h2>Step 2: Explanation of Gene Sequences for Transcription and Translation</h2>
        <p>A gene includes a number of important sequences that ensure transcription and translation of the gene: Promoter, initiation and termination sequences, RBS, start and stop codons. Briefly describe the role and function of each of these within the <i>M. capsulatus</i> (be sure to indicate whether it is important for transcription or for translation). Since billionaire Ni&ntilde;o-Soto may question why she must understand such detail, indicate why you think it is important to understand in your report to the NSF (i.e. the text box below).</p>
        <textarea placeholder="Enter your text here"></textarea>`
    },
    {
      "number": 6,
      "kind": "write",
      "name": "Step 3: Structure of the pmoCAB Operon",
      "thumbnail": "/reports/imgs/pmo_operon.png",
      "html": `
        <h2>Step 3: Structure of the <i>pmoCAB</i> Operon</h2>
        <ul>In the text box below, respond to the following questions using full sentences:
          <li>1. How many promoters would be necessary to allow transcription of the pmoCAB operon?</li>
          <li>2. How many mRNA molecules will be produced when this operon is transcribed?</li>
          <li>3. How many ribosome binding sites will be present on the RNA produced when the pmo operon is transcribed?</li>
          <li>4. How many start codons will be present on the RNA produced when the pmo operon is transcribed?</li>
          <li>5. How many stop codons will be present on the RNA produced when the pmo operon is transcribed?</li>
        </ul>
        <textarea placeholder="Enter your text here"></textarea>
        <ul>Use the figure below to respond to the following questions. Type your answers in the text box using full sentences.
          <li>1. Which letter best marks the area within the DNA sequence where RNA polymerase would bind to ensure transcription of pmoA, pmoB, and pmoC as a unit?</li>
          <li>2. Which letter best marks the area within the DNA sequence that serves as the initiation site for transcription?</li>
          <li>3. Which letter best marks the area within the DNA sequence that serves as the termination site for transcription?</li>
          <li>4. Which letter best marks the area within the DNA sequence that contains sequences encoding a translational start site?</li>
          <li>5. Which letter best marks the area within the DNA sequence that contains sequences encoding translational stop codons?</li>
          <li>6. Which letter marks the 5’ end of the DNA strand?</li>
        </ul>
        <img src="/reports/imgs/pmo_operon.png"></img>
        <textarea placeholder="Enter your text here"></textarea>`
    }
  ]
}


// NOT USED CURRENTLY

Skeletor.Mobile.html = [
  `
  <h2>Introduction</h2>
  <p>Cattle farming is a key component of Canadian agriculture. However, approximately 23% of Canada’s methane emissions are from cow burps ("enteric fermentations"). This number is troubling because the Global Warming Potential (GWP) of methane is 21 times that of carbon dioxide on a 100-year time scale (Environmental Protection Agency, 2013). Some progress in methane reduction has been made by scientists who have adjusted the composition of cattle feed (Rathke, 2013), but opportunities exist to pursue more cutting-edge approaches.</p>
  <p>Maria Niño-Soto, a self-made billionaire, has decided to become a leader in the cattle industry by finding ways to make it more environmentally friendly. Towards this end, she has started the Niño-Soto Foundation (NSF) to fund research projects that could provide new solutions to problems in the cattle industry. You have been hired by the NSF as an expert reviewer, tasked with evaluating a research proposal in order to decide if the proposed project is both possible and scientifically sound. As part of your evaluation, you will prepare a report to Maria Niño-Soto in which you explain key elements of the research and comment on its plausibility.</p>
  `,
  `
  <h2>Research Proposal</h2>
  <object id="attach-terms-pdf-content" type="application/pdf" data="reports/pdfs/bovine_methane_proposal.pdf?#zoom=60&scrollbar=0&toolbar=0&navpanes=0"><p>PDF cannot be displayed</p></object>
  `,
  `
  <h2>The Underlying Science</h2>
  <p>The enzyme pMMO (particulate methane monooxygenase) is a key part of Dr. Heifer Sutherland’s proposed project, so you will need to understand some basic features of this protein complex and the genes encoding it. You review the literature about pMMO and learn that pMMO is a membrane-bound copper and iron containing enzyme. The structural genes for this enzyme lie in a three-gene operon named <i>pmoCAB</i>. This operon codes for the three integral membrane polypeptides: PmoC, PmoA and PmoB of approximately 23, 27, and 45 kDa, respectively, that make up the final functional enzyme pMMO (McDonald et al., 2008).</p>
  <p>It is really important that the NSF understands that the genes contain all the information necessary for a cell to produce methane monooxygenase. You decide that your report to the NSF should contain the answers to the following specific questions in order to be able to understand the proposed project and to be able to address questions surrounding its feasibility.</p>
  `,
  `
  <h2>Step 1: Representation of the <i>pmoCAB</i> Operon</h2>
  <p>Which diagram would you choose as the most useful and accurate depiction of the arrangement of the genes in the chromosome of <i>M. capsulatus</i>? In the text box below, indicate the letter of your chosen diagram and give reasons to support your choice.</p>
  <img src="reports/imgs/pmo_genes.png"></img>
  <textarea placeholder="Enter your text here"></textarea>
  `,
  `
  <h2>Step 2: Explanation of Gene Sequences for Transcription and Translation</h2>
  <p>A gene includes a number of important sequences that ensure transcription and translation of the gene: Promoter, initiation and termination sequences, RBS, start and stop codons. Briefly describe the role and function of each of these within the <i>M. capsulatus</i> (be sure to indicate whether it is important for transcription or for translation). Since billionaire Ni&ntilde;o-Soto may question why she must understand such detail, indicate why you think it is important to understand in your report to the NSF (i.e. the text box below).</p>
  <textarea placeholder="Enter your text here"></textarea>
  `,
  `
  <h2>Step 3: Structure of the <i>pmoCAB</i> Operon</h2>
  <ul>In the text box below, respond to the following questions using full sentences:
    <li>1. How many promoters would be necessary to allow transcription of the pmoCAB operon?</li>
    <li>2. How many mRNA molecules will be produced when this operon is transcribed?</li>
    <li>3. How many ribosome binding sites will be present on the RNA produced when the pmo operon is transcribed?</li>
    <li>4. How many start codons will be present on the RNA produced when the pmo operon is transcribed?</li>
    <li>5. How many stop codons will be present on the RNA produced when the pmo operon is transcribed?</li>
  </ul>
  <textarea placeholder="Enter your text here"></textarea>
  <ul>Use the figure below to respond to the following questions. Type your answers in the text box using full sentences.
    <li>1. Which letter best marks the area within the DNA sequence where RNA polymerase would bind to ensure transcription of pmoA, pmoB, and pmoC as a unit?</li>
    <li>2. Which letter best marks the area within the DNA sequence that serves as the initiation site for transcription?</li>
    <li>3. Which letter best marks the area within the DNA sequence that serves as the termination site for transcription?</li>
    <li>4. Which letter best marks the area within the DNA sequence that contains sequences encoding a translational start site?</li>
    <li>5. Which letter best marks the area within the DNA sequence that contains sequences encoding translational stop codons?</li>
    <li>6. Which letter marks the 5’ end of the DNA strand?</li>
  </ul>
  <img src="/reports/imgs/pmo_operon.png"></img>
  <textarea placeholder="Enter your text here"></textarea>
  `
]