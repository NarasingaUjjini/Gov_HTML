/**
 * Sample question data for AP Government quiz tool testing
 * Contains representative questions from all 5 AP Gov units
 */

const sampleQuestions = [
    // Unit 1: Foundations of American Democracy
    {
        id: "unit1_q1",
        unit: 1,
        question: "Which of the following best describes the concept of federalism in the United States?",
        options: [
            "The national government has complete authority over state governments",
            "Power is shared between national and state governments",
            "State governments have complete authority over the national government",
            "Local governments have the most authority in the system"
        ],
        correct: 1,
        explanation: "Federalism is a system where power is divided and shared between national and state governments, with each level having certain exclusive powers and some shared powers."
    },
    {
        id: "unit1_q2",
        unit: 1,
        question: "The principle of separation of powers is best illustrated by which of the following?",
        options: [
            "The president's ability to veto congressional legislation",
            "The Supreme Court's power to interpret the Constitution",
            "Congress's power to impeach federal officials",
            "All of the above demonstrate separation of powers"
        ],
        correct: 3,
        explanation: "Separation of powers divides government into three branches (executive, legislative, judicial) with distinct functions, and all the listed examples show how each branch has specific powers."
    },
    {
        id: "unit1_q3",
        unit: 1,
        question: "Which document established the first government of the United States?",
        options: [
            "The Constitution",
            "The Declaration of Independence", 
            "The Articles of Confederation",
            "The Bill of Rights"
        ],
        correct: 2,
        explanation: "The Articles of Confederation served as the first constitution of the United States from 1781 until it was replaced by the current Constitution in 1788."
    },

    // Unit 2: Interactions Among Branches of Government
    {
        id: "unit2_q1",
        unit: 2,
        question: "Which of the following is an example of checks and balances?",
        options: [
            "The president appointing Supreme Court justices",
            "Congress overriding a presidential veto with a two-thirds majority",
            "The Supreme Court declaring a law unconstitutional",
            "All of the above are examples of checks and balances"
        ],
        correct: 3,
        explanation: "Checks and balances allow each branch to limit the power of the others. All listed examples show how one branch can check another's power."
    },
    {
        id: "unit2_q2",
        unit: 2,
        question: "The Senate's power to confirm presidential appointments is an example of which principle?",
        options: [
            "Separation of powers",
            "Checks and balances",
            "Federalism",
            "Popular sovereignty"
        ],
        correct: 1,
        explanation: "The Senate's confirmation power is a check on the executive branch's appointment power, demonstrating the system of checks and balances."
    },
    {
        id: "unit2_q3",
        unit: 2,
        question: "Which of the following best describes the role of congressional committees?",
        options: [
            "They have no real power in the legislative process",
            "They review and modify legislation before it goes to the full chamber",
            "They only exist to delay the passage of bills",
            "They are controlled entirely by the executive branch"
        ],
        correct: 1,
        explanation: "Congressional committees play a crucial role in reviewing, modifying, and shaping legislation before it reaches the full House or Senate for a vote."
    },

    // Unit 3: Civil Liberties and Civil Rights
    {
        id: "unit3_q1",
        unit: 3,
        question: "The 'clear and present danger' test is associated with which type of constitutional issue?",
        options: [
            "Freedom of speech limitations",
            "Search and seizure protections",
            "Due process rights",
            "Equal protection under the law"
        ],
        correct: 0,
        explanation: "The 'clear and present danger' test, established in Schenck v. United States, determines when the government can limit free speech if it poses a clear and present danger to society."
    },
    {
        id: "unit3_q2",
        unit: 3,
        question: "Which amendment protects against unreasonable searches and seizures?",
        options: [
            "Third Amendment",
            "Fourth Amendment",
            "Fifth Amendment",
            "Sixth Amendment"
        ],
        correct: 1,
        explanation: "The Fourth Amendment protects citizens from unreasonable searches and seizures and generally requires warrants based on probable cause."
    },
    {
        id: "unit3_q3",
        unit: 3,
        question: "The Supreme Court case Brown v. Board of Education primarily dealt with which issue?",
        options: [
            "Freedom of speech in schools",
            "School prayer",
            "Racial segregation in public schools",
            "Student dress codes"
        ],
        correct: 2,
        explanation: "Brown v. Board of Education (1954) declared that racial segregation in public schools was unconstitutional, overturning the 'separate but equal' doctrine."
    },

    // Unit 4: American Political Ideologies and Beliefs
    {
        id: "unit4_q1",
        unit: 4,
        question: "Which of the following best describes political socialization?",
        options: [
            "The process by which people form their political beliefs and values",
            "The way politicians communicate with voters",
            "The method used to conduct political polls",
            "The process of registering to vote"
        ],
        correct: 0,
        explanation: "Political socialization is the lifelong process through which individuals acquire their political beliefs, values, and behaviors through family, school, media, and other influences."
    },
    {
        id: "unit4_q2",
        unit: 4,
        question: "Public opinion polls are most accurate when they use which type of sampling?",
        options: [
            "Convenience sampling",
            "Random sampling",
            "Voluntary response sampling",
            "Quota sampling"
        ],
        correct: 1,
        explanation: "Random sampling gives every member of the population an equal chance of being selected, which produces the most representative and accurate results."
    },
    {
        id: "unit4_q3",
        unit: 4,
        question: "Which factor is most likely to influence an individual's political ideology?",
        options: [
            "Family background",
            "Geographic location",
            "Education level",
            "All of the above significantly influence political ideology"
        ],
        correct: 3,
        explanation: "Political ideology is shaped by multiple factors including family upbringing, where someone lives, their educational experiences, and many other social and economic factors."
    },

    // Unit 5: Political Participation
    {
        id: "unit5_q1",
        unit: 5,
        question: "Which of the following is the most common form of political participation in the United States?",
        options: [
            "Running for office",
            "Attending political rallies",
            "Voting in elections",
            "Contacting elected officials"
        ],
        correct: 2,
        explanation: "Voting is the most widespread form of political participation, though voter turnout varies significantly between different types of elections."
    },
    {
        id: "unit5_q2",
        unit: 5,
        question: "What is the primary function of political parties in the electoral process?",
        options: [
            "To confuse voters with too many choices",
            "To organize government and provide choices for voters",
            "To prevent people from voting",
            "To control the media"
        ],
        correct: 1,
        explanation: "Political parties serve to organize government, recruit candidates, provide policy alternatives, and help voters make informed choices by offering distinct platforms."
    },
    {
        id: "unit5_q3",
        unit: 5,
        question: "Which of the following best explains why voter turnout is typically lower in midterm elections?",
        options: [
            "Midterm elections are held on different days than presidential elections",
            "There is generally less media coverage and public interest in midterm elections",
            "Midterm elections use different voting methods",
            "Only certain people are allowed to vote in midterm elections"
        ],
        correct: 1,
        explanation: "Midterm elections typically receive less media attention and generate less public interest than presidential elections, leading to lower voter turnout."
    },

    // Additional questions for better testing coverage
    {
        id: "unit1_q4",
        unit: 1,
        question: "The concept of 'consent of the governed' is most closely associated with which political theory?",
        options: [
            "Social contract theory",
            "Divine right theory",
            "Marxist theory",
            "Anarchist theory"
        ],
        correct: 0,
        explanation: "Social contract theory, developed by philosophers like Locke and Rousseau, holds that government derives its authority from the consent of the governed."
    },
    {
        id: "unit2_q4",
        unit: 2,
        question: "Which of the following is NOT a formal power of the president?",
        options: [
            "Commanding the military as Commander in Chief",
            "Vetoing legislation passed by Congress",
            "Declaring war on foreign nations",
            "Appointing federal judges"
        ],
        correct: 2,
        explanation: "Only Congress has the constitutional power to declare war. The president can command military forces but cannot formally declare war without congressional approval."
    },
    {
        id: "unit3_q4",
        unit: 3,
        question: "The incorporation doctrine refers to which of the following?",
        options: [
            "The process of adding new states to the Union",
            "The application of Bill of Rights protections to state governments",
            "The creation of new federal agencies",
            "The process of amending the Constitution"
        ],
        correct: 1,
        explanation: "The incorporation doctrine is the legal principle that applies most Bill of Rights protections to state and local governments through the Fourteenth Amendment."
    },
    {
        id: "unit4_q4",
        unit: 4,
        question: "Which demographic factor is most strongly correlated with voter turnout?",
        options: [
            "Age",
            "Gender",
            "Geographic region",
            "Political party affiliation"
        ],
        correct: 0,
        explanation: "Age is the strongest predictor of voter turnout, with older citizens consistently voting at much higher rates than younger citizens."
    },
    {
        id: "unit5_q4",
        unit: 5,
        question: "Interest groups primarily influence policy through which of the following activities?",
        options: [
            "Running candidates for office",
            "Lobbying government officials",
            "Conducting public opinion polls",
            "Organizing voter registration drives"
        ],
        correct: 1,
        explanation: "While interest groups engage in various activities, lobbying government officials is their primary method of influencing policy decisions."
    }
];

// Export for use in testing and development
if (typeof module !== 'undefined' && module.exports) {
    module.exports = sampleQuestions;
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
    window.sampleQuestions = sampleQuestions;
}