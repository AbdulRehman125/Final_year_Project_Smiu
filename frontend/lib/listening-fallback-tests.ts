import type { ListeningTest } from "./listening-types";

export const FALLBACK_LISTENING_TESTS: ListeningTest[] = [
  {
    id: "seed-listening-test-1",
    title: "IELTS Listening Practice Test 1",
    difficulty: "mixed",
    topics: ["Accommodation Booking", "Museum Tour", "University Assignment", "Climate Change Lecture"],
    totalQuestions: 40,
    audioUrls: {},
    transcripts: {},
    sections: [
      {
        index: 0,
        title: "Booking Accommodation at a Hotel",
        description: "A conversation between a receptionist and a customer booking a room.",
        difficulty: "easy",
        speakers: 2,
        speakerNames: ["Sarah", "Receptionist"],
        durationMinutes: 7,
        questionRange: [1, 10],
        transcript: "",
        audioUrl: ""
      },
      {
        index: 1,
        title: "Tour Guide Explaining Museum Facilities",
        description: "A tour guide introducing the facilities and rules of a local museum.",
        difficulty: "moderate",
        speakers: 1,
        speakerNames: ["Tour Guide"],
        durationMinutes: 8,
        questionRange: [11, 20],
        transcript: "",
        audioUrl: ""
      },
      {
        index: 2,
        title: "Students Discussing Research Project",
        description: "Two students discussing their upcoming research project with their professor.",
        difficulty: "hard",
        speakers: 3,
        speakerNames: ["James", "Emily", "Professor Wilson"],
        durationMinutes: 8,
        questionRange: [21, 30],
        transcript: "",
        audioUrl: ""
      },
      {
        index: 3,
        title: "Lecture on Climate Change and Ocean Ecosystems",
        description: "A university lecture about the impact of climate change on marine life.",
        difficulty: "hard",
        speakers: 1,
        speakerNames: ["Professor Anderson"],
        durationMinutes: 9,
        questionRange: [31, 40],
        transcript: "",
        audioUrl: ""
      }
    ],
    questions: [
      // Section 1
      { index: 1, sectionIndex: 0, type: "sentence_completion", text: "The customer's first name is", correctAnswer: "Sarah", explanation: "She introduces herself as Sarah." },
      { index: 2, sectionIndex: 0, type: "sentence_completion", text: "Check-in date is the 15th of", correctAnswer: "August", explanation: "The receptionist confirms the date as August 15th." },
      { index: 3, sectionIndex: 0, type: "sentence_completion", text: "The customer wants a", correctAnswer: "double room", explanation: "Sarah requested a double room." },
      { index: 4, sectionIndex: 0, type: "sentence_completion", text: "The price per night is", correctAnswer: "120", explanation: "The cost is $120 per night." },
      { index: 5, sectionIndex: 0, type: "sentence_completion", text: "Contact phone number is", correctAnswer: "0785643219", explanation: "She gives her number as 0785643219." },
      { index: 6, sectionIndex: 0, type: "short_answer", text: "What time is check-in?", correctAnswer: "3 PM", explanation: "Check-in is at 3 PM." },
      { index: 7, sectionIndex: 0, type: "short_answer", text: "What special request did she make?", correctAnswer: "sea view", explanation: "She asked for a room with a sea view." },
      { index: 8, sectionIndex: 0, type: "short_answer", text: "Is breakfast included?", correctAnswer: "yes", explanation: "Breakfast is included in the price." },
      { index: 9, sectionIndex: 0, type: "short_answer", text: "Does the hotel have parking?", correctAnswer: "yes", explanation: "The hotel offers free parking." },
      { index: 10, sectionIndex: 0, type: "short_answer", text: "What is the total cost for 2 nights?", correctAnswer: "240", explanation: "120 * 2 = 240." },
      
      // Section 2
      { index: 11, sectionIndex: 1, type: "mcq", text: "The museum opens at:", options: ["9 AM", "10 AM", "11 AM"], correctAnswer: "10 AM", explanation: "The tour guide says the doors open at 10 AM." },
      { index: 12, sectionIndex: 1, type: "mcq", text: "Photography is allowed in:", options: ["The main hall", "Special exhibits", "Nowhere"], correctAnswer: "The main hall", explanation: "Photography is restricted except for the main hall." },
      { index: 13, sectionIndex: 1, type: "mcq", text: "The cafe is located on:", options: ["Ground floor", "First floor", "Second floor"], correctAnswer: "Ground floor", explanation: "The cafe is conveniently located on the ground floor." },
      { index: 14, sectionIndex: 1, type: "mcq", text: "Guided tours start every:", options: ["30 minutes", "Hour", "2 hours"], correctAnswer: "Hour", explanation: "Tours depart every hour on the hour." },
      { index: 15, sectionIndex: 1, type: "mcq", text: "Cloakrooms are:", options: ["Free", "Cost 1 pound", "Cost 2 pounds"], correctAnswer: "Free", explanation: "The cloakroom service is complimentary." },
      { index: 16, sectionIndex: 1, type: "matching", text: "Ancient Egypt Exhibit", options: ["North Wing", "South Wing", "East Wing"], correctAnswer: "North Wing", explanation: "Ancient Egypt is located in the North Wing." },
      { index: 17, sectionIndex: 1, type: "matching", text: "Dinosaur Fossils", options: ["North Wing", "South Wing", "East Wing"], correctAnswer: "South Wing", explanation: "Fossils are displayed in the South Wing." },
      { index: 18, sectionIndex: 1, type: "matching", text: "Modern Art", options: ["North Wing", "South Wing", "East Wing", "West Wing"], correctAnswer: "East Wing", explanation: "Modern Art is in the East Wing." },
      { index: 19, sectionIndex: 1, type: "matching", text: "Gift Shop", options: ["Entrance", "Exit", "Basement"], correctAnswer: "Exit", explanation: "The gift shop is near the exit." },
      { index: 20, sectionIndex: 1, type: "matching", text: "Restrooms", options: ["Every floor", "Ground floor only", "Basement"], correctAnswer: "Every floor", explanation: "Restrooms are available on every floor." },

      // Section 3
      { index: 21, sectionIndex: 2, type: "mcq", text: "The main topic of their research is:", options: ["Urban planning", "Public transport", "Air pollution"], correctAnswer: "Public transport", explanation: "They are focusing on public transport efficiency." },
      { index: 22, sectionIndex: 2, type: "mcq", text: "They will collect data using:", options: ["Interviews", "Online surveys", "Observations"], correctAnswer: "Online surveys", explanation: "They decided online surveys would be most efficient." },
      { index: 23, sectionIndex: 2, type: "mcq", text: "The deadline for the draft is:", options: ["Next week", "In two weeks", "Next month"], correctAnswer: "In two weeks", explanation: "The professor reminds them the draft is due in two weeks." },
      { index: 24, sectionIndex: 2, type: "mcq", text: "Emily is worried about:", options: ["Sample size", "Data analysis", "Writing the report"], correctAnswer: "Sample size", explanation: "Emily expresses concern about getting enough responses." },
      { index: 25, sectionIndex: 2, type: "mcq", text: "James will handle:", options: ["Literature review", "Methodology", "Conclusion"], correctAnswer: "Literature review", explanation: "James agrees to draft the literature review." },
      { index: 26, sectionIndex: 2, type: "sentence_completion", text: "They need at least _____ responses.", correctAnswer: "100", explanation: "The professor suggests aiming for 100 responses." },
      { index: 27, sectionIndex: 2, type: "sentence_completion", text: "The survey will be distributed via _____.", correctAnswer: "email", explanation: "They will send the survey link via email." },
      { index: 28, sectionIndex: 2, type: "sentence_completion", text: "They will use _____ software for analysis.", correctAnswer: "SPSS", explanation: "They plan to analyze data using SPSS." },
      { index: 29, sectionIndex: 2, type: "sentence_completion", text: "The final presentation is worth _____ percent.", correctAnswer: "30", explanation: "The presentation makes up 30% of the grade." },
      { index: 30, sectionIndex: 2, type: "sentence_completion", text: "They will meet again on _____.", correctAnswer: "Thursday", explanation: "They schedule their next meeting for Thursday." },

      // Section 4
      { index: 31, sectionIndex: 3, type: "sentence_completion", text: "Ocean temperatures have risen by _____ degrees.", correctAnswer: "1.5", explanation: "The professor notes a 1.5 degree increase." },
      { index: 32, sectionIndex: 3, type: "sentence_completion", text: "Coral reefs are experiencing severe _____.", correctAnswer: "bleaching", explanation: "Widespread coral bleaching is observed." },
      { index: 33, sectionIndex: 3, type: "sentence_completion", text: "Increased carbon dioxide causes ocean _____.", correctAnswer: "acidification", explanation: "CO2 absorption leads to acidification." },
      { index: 34, sectionIndex: 3, type: "sentence_completion", text: "_____ populations are declining rapidly.", correctAnswer: "Fish", explanation: "Many fish populations are shrinking." },
      { index: 35, sectionIndex: 3, type: "sentence_completion", text: "Sea level rise threatens _____ communities.", correctAnswer: "coastal", explanation: "Coastal areas are at high risk." },
      { index: 36, sectionIndex: 3, type: "short_answer", text: "What is the primary greenhouse gas mentioned?", correctAnswer: "Carbon dioxide", explanation: "CO2 is the main focus." },
      { index: 37, sectionIndex: 3, type: "short_answer", text: "Which ocean is warming fastest?", correctAnswer: "Arctic", explanation: "The Arctic Ocean shows the most rapid warming." },
      { index: 38, sectionIndex: 3, type: "short_answer", text: "What organisms form the base of the marine food web?", correctAnswer: "Phytoplankton", explanation: "Phytoplankton are crucial to the food web." },
      { index: 39, sectionIndex: 3, type: "short_answer", text: "Name one strategy to protect marine ecosystems.", correctAnswer: "Marine protected areas", explanation: "Establishing marine protected areas is suggested." },
      { index: 40, sectionIndex: 3, type: "short_answer", text: "When was the peak of coral bleaching recorded?", correctAnswer: "2016", explanation: "The worst bleaching occurred in 2016." }
    ]
  },
  {
    id: "seed-listening-test-2",
    title: "IELTS Listening Practice Test 2",
    difficulty: "mixed",
    topics: ["Job Interview", "Library Registration", "Group Assignment", "Space Exploration"],
    totalQuestions: 40,
    audioUrls: {},
    transcripts: {},
    sections: [
      {
        index: 0,
        title: "Applying for a Part-time Job",
        description: "A conversation about a job application.",
        difficulty: "easy",
        speakers: 2,
        speakerNames: ["Manager", "Applicant"],
        durationMinutes: 6,
        questionRange: [1, 10],
        transcript: "",
        audioUrl: ""
      },
      {
        index: 1,
        title: "Joining the Local Library",
        description: "Information about library services.",
        difficulty: "moderate",
        speakers: 1,
        speakerNames: ["Librarian"],
        durationMinutes: 7,
        questionRange: [11, 20],
        transcript: "",
        audioUrl: ""
      },
      {
        index: 2,
        title: "Planning a Marketing Campaign",
        description: "Students discussing their project.",
        difficulty: "hard",
        speakers: 3,
        speakerNames: ["Tom", "Lisa", "Mark"],
        durationMinutes: 8,
        questionRange: [21, 30],
        transcript: "",
        audioUrl: ""
      },
      {
        index: 3,
        title: "The Future of Mars Exploration",
        description: "A lecture on space missions.",
        difficulty: "hard",
        speakers: 1,
        speakerNames: ["Dr. Smith"],
        durationMinutes: 9,
        questionRange: [31, 40],
        transcript: "",
        audioUrl: ""
      }
    ],
    questions: Array.from({ length: 40 }, (_, i) => ({
      index: i + 1,
      sectionIndex: Math.floor(i / 10),
      type: "short_answer" as const,
      text: `Question ${i + 1}`,
      correctAnswer: "answer",
      explanation: "explanation"
    }))
  }
];
