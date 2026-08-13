---
layout: homepage
---

## About Me

I am a **Ph.D. student** in **Systems Engineering** at the **University of Virginia (UVA)**. I received my Bachelor's degree from Hong Kong Baptist University (HKBU) with **First Class Honors**, majoring in **Sociology** with a minor in **Computer Science**. My studies combine **sociological perspectives** on human behavior and social issues with **computational and LLM agent-based methods** for modeling and analyzing complex systems.

Driven by a strong conviction in the transformative potential of **interdisciplinary research**, I am passionate about exploring the convergence of social science and AI in the era of big data and intelligent technologies. I am particularly interested in how these **sociological theories-guided LLM agents** can enable novel insights into **social simulations** and **complex societal dynamics** that both traditional data-driven machine learning and social science research cannot achieve.

I am currently supervised by <a href="https://hongru94.github.io/" target="_blank" rel="noopener noreferrer">Prof. Hongru Du</a> at <a href="https://engineering.virginia.edu/labs-groups/du-lab" target="_blank" rel="noopener noreferrer">Du Lab</a>, <a href="https://engineering.virginia.edu/sie" target="_blank" rel="noopener noreferrer">Department of Systems and Information Engineering, University of Virginia</a> and collaborating with him to focus on the research of **theory-guided LLM agent-based modeling** and exploring its applications in domains including **modeling human behavior and public health**. Previously, I also served as a **Research Intern** at Tsinghua University’s <a href="https://fi.ee.tsinghua.edu.cn/" target="_blank" rel="noopener noreferrer">Future Intelligence Lab</a> under the supervision of <a href="https://fenglixu.github.io/" target="_blank" rel="noopener noreferrer">Prof. Fengli Xu</a> and collaborated with <a href="https://sociology.uchicago.edu/directory/james-evans" target="_blank" rel="noopener noreferrer">Prof. James Evans</a> at the <a href="https://knowledgelab.org/" target="_blank" rel="noopener noreferrer">Knowledge Lab</a>, University of Chicago, where I focus on **designing LLM-driven agents in physical environment and AI scientists in complex context**. <!-- I also worked as a **Research Assistant** to explore LLM Agents that **simulate urban policy planner and human decision-making behavior** under the supervision of <a href="https://sai.cuhk.edu.cn/en/teacher/154" target="_blank" rel="noopener noreferrer">Prof. Zhanzhan Zhao</a>,  Assistant Professor, <a href="https://sai.cuhk.edu.cn/en" target="_blank" rel="noopener noreferrer">School of School of Artificial Intelligence</a>, <a href="https://www.cuhk.edu.cn/en" target="_blank" rel="noopener noreferrer">The Chinese University of Hong Kong, Shenzhen</a>.-->

For more details, please see my <a href="assets/Haoyang_Li_CV_latest.pdf" target="_blank" rel="noopener noreferrer">CV</a> _(last updated 12 Aug, 2026)_.

<span style="color:#E4002B; font-weight: bold;">If you are interested in my work or have potential ideas to explore together, please feel free to email me. I would be happy to discuss further :-)</span> 

<style>
/* ===== Unified bullets: Research Interests / Experience / News ===== */

:is(#research-interests, #research-experience, #news) + ul {
  --bullet-x: -1.28em;
  --bullet-y: 0.75em;
  --bullet-size: 0.38em;

  list-style: none;
  padding-left: 2.5em;
}

/* Top-level items */
:is(#research-interests, #research-experience, #news) + ul > li {
  position: relative;
}

/* Filled top-level bullet */
:is(#research-interests, #research-experience, #news) + ul > li::before {
  content: "";
  position: absolute;

  left: var(--bullet-x);
  top: var(--bullet-y);

  width: var(--bullet-size);
  height: var(--bullet-size);

  border-radius: 50%;
  background: currentColor;

  transform: translate(-50%, -50%);
}

/* Nested lists */
:is(#research-interests, #research-experience, #news) + ul ul {
  list-style: none;
  padding-left: 2.5em;
  margin-bottom: 0 !important;
}

:is(#research-interests, #research-experience, #news) + ul ul > li {
  position: relative;
}

/* Hollow nested bullet */
:is(#research-interests, #research-experience, #news) + ul ul > li::before {
  content: "";
  position: absolute;

  left: -1.28em;
  top: 0.75em;

  width: 0.32em;
  height: 0.32em;

  box-sizing: border-box;
  border: 1px solid currentColor;
  border-radius: 50%;
  background: transparent;

  transform: translate(-50%, -50%);
}

/* ===== UVA role progression ===== */

/* GRA and Intern stay close */
#research-experience + ul > li:first-child {
  margin-bottom: 0;
}

/* Line from GRA bullet to Intern bullet */
#research-experience + ul > li:first-child::after {
  content: "";
  position: absolute;

  /* EXACTLY the same x coordinate as the bullet */
  left: var(--bullet-x);

  /* tiny gaps at the two dots */
  top: 0.96em;
  bottom: -0.54em;

  width: 1px;
  background: #b5b5b5;

  transform: translateX(-50%);
}

/* Space after the UVA block */
#research-experience + ul > li:nth-child(2) {
  margin-bottom: 0.75em;
}

@media (prefers-color-scheme: dark) {
  #research-experience + ul > li:first-child::after {
    background: #777;
  }
}
</style>

## Research Interests

- **AI for Science & LLM Agents**: Sociological theory + LLM agents, LLM-based multi-agent systems, LLM for social simulation, AI for Science
- **Social Networks**: Structure of social networks (structure hole, tie strength, etc.)

<!--
- **Quantitative Sociology**: Social statistics, Hypothesis testing, Regression models
- **Social Stratification**: Social capital, Cultural reproduction
-->

## Research Experience
- **Graduate Research Assistant**, _2026.08 - Current_, <a href="https://engineering.virginia.edu/labs-groups/du-lab" target="_blank" rel="noopener noreferrer">Du Lab</a>, <a href="https://engineering.virginia.edu/sie" target="_blank" rel="noopener noreferrer">University of Virginia</a>
- **Research Intern**, _2025.07 - 2026.07_
    - Supervised by <a href="https://hongru94.github.io/" target="_blank" rel="noopener noreferrer">Prof. Hongru Du</a>
    - _Research Focus_: AI for Science, Modeling Human Behavior through LLM Agents
- **Research Intern**, _2025.10 - 2026.08_, <a href="https://knowledgelab.org/" target="_blank" rel="noopener noreferrer">Knowledge Lab, University of Chicago</a>
    - Supervised by <a href="https://sociology.uchicago.edu/directory/james-evans" target="_blank" rel="noopener noreferrer">Prof. James Evans</a>
    - _Research Focus_: AI Scientists for Market Allocation
- **Research Intern**, _2025.03 - 2026.08_, <a href="https://fi.ee.tsinghua.edu.cn/" target="_blank" rel="noopener noreferrer">Future Intelligence Lab, Tsinghua University</a>
    - Supervised by <a href="https://fenglixu.github.io/" target="_blank" rel="noopener noreferrer">Prof. Fengli Xu</a>
    - _Research Focus_: LLM Agent, Social Simulation
- **Research Assistant**, _2025.07 - 2025.12_, <a href="https://sai.cuhk.edu.cn/en" target="_blank" rel="noopener noreferrer">School of Artificial Intelligence, The Chinese University of Hong Kong, Shenzhen</a>
    - Supervised by <a href="https://sai.cuhk.edu.cn/en/teacher/154" target="_blank" rel="noopener noreferrer">Prof. Zhanzhan Zhao</a>
    - _Research Focus_: LLM and Game Theory

## News
- **[Aug 2026]** I arrived in Charlottesville!

<!--
- **[Feb. 2026]** A **first-authored** paper advised by <a href="https://hongru94.github.io/" target="_blank" rel="noopener noreferrer">Prof. Hongru Du</a> focusing on **Modeling Human Mobility Using LLM Agent** is avilable on <a href="https://www.researchsquare.com/article/rs-8902418/v1" target="_blank" rel="noopener noreferrer">Research Square</a>.
- **[Nov. 2025]** A **co-first-authored** ongoing project focusing on **AI Scientists on Market Mechanisms** is presented as a poster at <a href="https://icais.ai/" target="_blank" rel="noopener noreferrer">ICAIS 2025 (The 1st International Conference on AI Scientists)</a> \[<a href="https://hao-yang-li.github.io/assets/files/ai_market_poster.pdf" target="_blank" rel="noopener noreferrer">View Poster</a>\]
- **[Jul. 2025]** Joined as a **research intern** in  <a href="https://hongru94.github.io/" target="_blank" rel="noopener noreferrer">Prof. Hongru Du</a>, <a href="https://engineering.virginia.edu/sie" target="_blank" rel="noopener noreferrer">Department of Systems and Information Engineering, University of Virginia</a>'s research group, focusing on **LLM agent-based modeling**.
- **[Jun. 2025]** A coauthored paper (under review) focused on **LLM agents and crime simulation** is available on <a href="https://arxiv.org/abs/2506.05981" target="_blank" rel="noopener noreferrer">arXiv:2506.05981</a>.
- **[Mar. 2025]** Joined <a href="https://fi.ee.tsinghua.edu.cn/" target="_blank" rel="noopener noreferrer">Future Intelligence Lab, Tsinghua University</a> as a **research intern**.-->

{% include_relative _includes/publications.md %}

<!--{% include_relative _includes/projects.md %}-->

{% include_relative _includes/awards.md %}

<!--{% include_relative _includes/services.md %}-->
<br>
<script type='text/javascript' id='mapmyvisitors' src='https://mapmyvisitors.com/map.js?cl=ffffff&w=300&t=tt&d=9YG5ofCHg5kjXJesSeDanGI_xGQa5W8fPMCIvLX86IA&co=2d78ad&ct=ffffff&cmo=3acc3a&cmn=ff5353'></script>

<script>
(function() {
    var checkLink = setInterval(function() {
        var mapLink = document.querySelector('a[href*="mapmyvisitors.com"]');
        
        if (mapLink) {
            mapLink.setAttribute('target', '_blank');
            
            mapLink.setAttribute('rel', 'noopener noreferrer');
            
            clearInterval(checkLink);
            console.log("Map link updated to open in new tab.");
        }
    }, 50);

    setTimeout(function() {
        clearInterval(checkLink);
    }, 10000);
})();
</script>
