// frontend/lib/reading-fallback-tests.ts — Authentic Pre-built IELTS Reading Tests

import type { ReadingTest } from "./reading-types";

export const FALLBACK_READING_TESTS: ReadingTest[] = [
  {
    id: "seed-test-1",
    title: "IELTS Academic Reading Test #1: Renewable Energy & History of Writing",
    difficulty: "mixed",
    topics: ["Renewable Energy in Remote Communities", "The History of Written Language", "Microplastics in Marine Ecosystems"],
    totalQuestions: 40,
    passages: [
      {
        index: 0,
        title: "Renewable Energy Transitions in Island Communities",
        difficulty: "easy",
        topic: "Renewable Energy in Remote Communities",
        questionRange: [1, 13],
        paragraphs: [
          {
            label: "A",
            text: "Remote island communities across the Pacific and Atlantic oceans have historically relied on imported diesel for power generation. Transporting fossil fuels to isolated geographic regions involves high freight costs and vulnerability to weather disruptions. In recent years, microgrid technological advancements combining solar photovoltaic arrays with battery energy storage systems have enabled these regions to achieve energy independence.",
          },
          {
            label: "B",
            text: "The island of Ta'u in American Samoa replaced over 109,000 gallons of diesel annually by installing 5,300 solar panels coupled with 60 Tesla Powerpack batteries. Within three days of system activation, the entire island's municipal water pumps, schools, and hospitals ran entirely on clean solar power.",
          },
          {
            label: "C",
            text: "Despite clear economic advantages, transitioning island grids presents technical challenges. Intermittent sunlight during monsoon seasons requires hybrid backup systems, typically biomass or biodiesel generators. Initial capital expenditure also remains a barrier for developing island economies without international climate finance assistance.",
          },
          {
            label: "D",
            text: "Long-term monitoring reveals that decentralized renewable energy microgrids reduce electricity tariffs by 40% over a twenty-year lifecycle. Moreover, local technical training programs empower residents to maintain hardware independently, fostering community resilience and economic stability.",
          },
        ],
      },
      {
        index: 1,
        title: "The Evolution of Written Language",
        difficulty: "moderate",
        topic: "The History of Written Language",
        questionRange: [14, 27],
        paragraphs: [
          {
            label: "A",
            text: "The origin of human writing dates to approximately 3200 BCE in ancient Mesopotamia. Early Sumerian cuneiform developed initially as a accounting mechanism to track agricultural commodities, livestock trades, and tax obligations rather than to capture poetic storytelling or royal decrees.",
          },
          {
            label: "B",
            text: "Clay tokens representing specific items were enclosed inside hollow clay spheres known as bullae. Impressing token shapes onto the outer clay surface before sealing allowed scribes to verify contents without breaking the container. Over centuries, these impressed marks evolved into abstract wedge-shaped symbols pressed into wet clay tablets with reed styluses.",
          },
          {
            label: "C",
            text: "Simultaneously, Egyptian hieroglyphics emerged around 3100 BCE, combining logographic, alphabetic, and ideographic elements. While Sumerians favored administrative utility, Egyptian script carried sacred significance, decorating temple walls, tombs, and papyrus scrolls reserved for priests and Pharaohs.",
          },
          {
            label: "D",
            text: "The transition from pictographic symbols representing whole objects to phonetic alphabets representing individual sounds occurred with the Phoenicians around 1000 BCE. The Phoenician 22-letter consonantal alphabet simplified literacy dramatically, spreading rapidly through maritime trade networks across the Mediterranean.",
          },
          {
            label: "E",
            text: "Linguists emphasize that the creation of writing fundamentally altered human cognition. Externalizing memory allowed complex historical records, scientific observation, and codified legal systems like the Code of Hammurabi to endure across generations without oral degradation.",
          },
        ],
      },
      {
        index: 2,
        title: "Microplastics and Ocean Bioaccumulation",
        difficulty: "hard",
        topic: "Microplastics in Marine Ecosystems",
        questionRange: [28, 40],
        paragraphs: [
          {
            label: "A",
            text: "Microplastics—defined as synthetic polymer fragments under five millimeters in size—constitute a pervasive anthropogenic threat to marine biosphere integrity. Originating from mechanical degradation of macro-plastics, synthetic textile washing, and industrial microbead additives, these particles accumulate in ocean gyres and estuarine sediments globally.",
          },
          {
            label: "B",
            text: "The ecological impact of microplastics extends beyond physical ingestion by pelagic marine species. Polymeric synthetic fibers possess high surface area-to-volume ratios, making them potent sorbents for hydrophobic persistent organic pollutants (POPs) such as polychlorinated biphenyls (PCBs) and organochlorine pesticides in seawater.",
          },
          {
            label: "C",
            text: "When zooplankton, filter-feeding bivalves, and juvenile fish ingest contaminated particles, lipophilic toxins desorb inside gastrointestinal tracts and bioaccumulate in adipose tissues. Trophic transfer propagates toxic concentrations up aquatic food webs to apex predators, including tuna, marine mammals, and human consumers.",
          },
          {
            label: "D",
            text: "Recent oceanographic research reveals that microplastic deposition is not restricted to surface waters. Deep-sea benthic surveys in the Mariana Trench identified micro-synthetic filaments in 100% of amphipod specimens retrieved at depths exceeding 10,000 meters, confirming abyssal benthic contamination.",
          },
          {
            label: "E",
            text: "Mitigation strategies necessitate upstream policy interventions, including legislative bans on primary microbeads, mandatory micro-fiber filters in commercial washing machines, and the industrial development of marine-degradable bio-polymers derived from algal cellulose.",
          },
          {
            label: "F",
            text: "Standardized global ocean monitoring protocols remain vital to mapping microplastic flux dynamics. International research coalitions are deploying automated satellite spectral sensors and ocean autonomous underwater vehicles (AUVs) to quantify particle density gradients in real-time.",
          },
        ],
      },
    ],
    questions: [
      // Passage 1: Q1 - Q13
      { index: 1, passageIndex: 0, type: "mcq", text: "What primary fuel source did remote islands traditionally depend on for electricity?", options: ["A. Import diesel fuel", "B. Wind energy", "C. Geothermal power", "D. Coal imports"], correctAnswer: "A", explanation: "Paragraph A states island communities historically relied on imported diesel.", paragraphRef: "A" },
      { index: 2, passageIndex: 0, type: "mcq", text: "How many Tesla Powerpack batteries were installed on Ta'u island?", options: ["A. 109,000", "B. 5,300", "C. 60", "D. 40"], correctAnswer: "C", explanation: "Paragraph B explicitly mentions 60 Tesla Powerpack batteries.", paragraphRef: "B" },
      { index: 3, passageIndex: 0, type: "mcq", text: "Which backup generators are used during extended monsoon periods?", options: ["A. Coal generators", "B. Biomass or biodiesel generators", "C. Nuclear reactors", "D. Hydro turbines"], correctAnswer: "B", explanation: "Paragraph C notes monsoon backup typically relies on biomass or biodiesel generators.", paragraphRef: "C" },
      { index: 4, passageIndex: 0, type: "mcq", text: "By what percentage do microgrids lower electricity tariffs over twenty years?", options: ["A. 10%", "B. 25%", "C. 40%", "D. 60%"], correctAnswer: "C", explanation: "Paragraph D states microgrids reduce tariffs by 40% over twenty years.", paragraphRef: "D" },

      { index: 5, passageIndex: 0, type: "true_false_not_given", text: "Transporting fossil fuel to isolated islands is completely unaffected by bad weather.", correctAnswer: "FALSE", explanation: "Paragraph A notes transport is vulnerable to weather disruptions.", paragraphRef: "A" },
      { index: 6, passageIndex: 0, type: "true_false_not_given", text: "Ta'u island replaced over 100,000 gallons of diesel per year.", correctAnswer: "TRUE", explanation: "Paragraph B confirms replacing over 109,000 gallons annually.", paragraphRef: "B" },
      { index: 7, passageIndex: 0, type: "true_false_not_given", text: "Developing island economies receive unlimited climate funding from international bodies.", correctAnswer: "NOT GIVEN", explanation: "Text mentions capital expenditure is a barrier without assistance, but does not state funding is unlimited.", paragraphRef: "C" },
      { index: 8, passageIndex: 0, type: "true_false_not_given", text: "Local technical training enables residents to maintain microgrid hardware.", correctAnswer: "TRUE", explanation: "Paragraph D confirms local training empowers residents to maintain hardware.", paragraphRef: "D" },

      { index: 9, passageIndex: 0, type: "sentence_completion", text: "High freight costs are caused by transporting fossil fuels to ______ geographic regions.", correctAnswer: "isolated", explanation: "Paragraph A mentions isolated geographic regions.", paragraphRef: "A" },
      { index: 10, passageIndex: 0, type: "sentence_completion", text: "Ta'u island installed 5,300 ______ panels to generate clean energy.", correctAnswer: "solar", explanation: "Paragraph B mentions 5,300 solar panels.", paragraphRef: "B" },
      { index: 11, passageIndex: 0, type: "sentence_completion", text: "High initial capital ______ remains a major barrier for developing economies.", correctAnswer: "expenditure", explanation: "Paragraph C notes initial capital expenditure is a barrier.", paragraphRef: "C" },
      { index: 12, passageIndex: 0, type: "sentence_completion", text: "Decentralized microgrids foster community resilience and economic ______.", correctAnswer: "stability", explanation: "Paragraph D states microgrids foster economic stability.", paragraphRef: "D" },
      { index: 13, passageIndex: 0, type: "sentence_completion", text: "Solar microgrids reduced electricity tariffs over a ______ lifecycle.", correctAnswer: "twenty-year", explanation: "Paragraph D refers to a twenty-year lifecycle.", paragraphRef: "D" },

      // Passage 2: Q14 - Q27
      { index: 14, passageIndex: 1, type: "mcq", text: "When did writing originate in Mesopotamia?", options: ["A. 1000 BCE", "B. 3100 BCE", "C. 3200 BCE", "D. 2000 BCE"], correctAnswer: "C", explanation: "Paragraph A specifies approximately 3200 BCE.", paragraphRef: "A" },
      { index: 15, passageIndex: 1, type: "mcq", text: "What was the initial primary purpose of Sumerian cuneiform?", options: ["A. Recording poetry", "B. Tracking agricultural commodities and trade", "C. Writing royal laws", "D. Communicating with foreign kings"], correctAnswer: "B", explanation: "Paragraph A states cuneiform developed as an accounting mechanism.", paragraphRef: "A" },
      { index: 16, passageIndex: 1, type: "mcq", text: "What materials were scribes pressing into wet clay tablets?", options: ["A. Metal needles", "B. Reed styluses", "C. Wooden sticks", "D. Bone pins"], correctAnswer: "B", explanation: "Paragraph B specifies reed styluses.", paragraphRef: "B" },
      { index: 17, passageIndex: 1, type: "mcq", text: "How many letters were in the Phoenician alphabet?", options: ["A. 12", "B. 22", "C. 26", "D. 30"], correctAnswer: "B", explanation: "Paragraph D mentions the 22-letter Phoenician alphabet.", paragraphRef: "D" },

      { index: 18, passageIndex: 1, type: "matching_headings", text: "Accounting origin of Sumerian writing", correctAnswer: "A", explanation: "Paragraph A describes agricultural record keeping.", paragraphRef: "A" },
      { index: 19, passageIndex: 1, type: "matching_headings", text: "Development from tokens to clay tablets", correctAnswer: "B", explanation: "Paragraph B explains bullae and reed styluses.", paragraphRef: "B" },
      { index: 20, passageIndex: 1, type: "matching_headings", text: "Sacred role of Egyptian hieroglyphics", correctAnswer: "C", explanation: "Paragraph C focuses on Egyptian religious script.", paragraphRef: "C" },
      { index: 21, passageIndex: 1, type: "matching_headings", text: "Phonetic simplification by Phoenicians", correctAnswer: "D", explanation: "Paragraph D discusses Phoenician 22-letter alphabet.", paragraphRef: "D" },
      { index: 22, passageIndex: 1, type: "matching_headings", text: "Cognitive impact and external memory", correctAnswer: "E", explanation: "Paragraph E details human cognition and law codes.", paragraphRef: "E" },

      { index: 23, passageIndex: 1, type: "short_answer", text: "What hollow clay containers were used to store accounting tokens?", correctAnswer: "bullae", explanation: "Paragraph B names clay spheres called bullae.", paragraphRef: "B" },
      { index: 24, passageIndex: 1, type: "short_answer", text: "What script emerged in Egypt around 3100 BCE?", correctAnswer: "hieroglyphics", explanation: "Paragraph C specifies Egyptian hieroglyphics.", paragraphRef: "C" },
      { index: 25, passageIndex: 1, type: "short_answer", text: "Through what networks did the Phoenician alphabet spread rapidly?", correctAnswer: "maritime trade", explanation: "Paragraph D states spread through maritime trade networks.", paragraphRef: "D" },
      { index: 26, passageIndex: 1, type: "short_answer", text: "What famous Mesopotamian legal code is mentioned in paragraph E?", correctAnswer: "Code of Hammurabi", explanation: "Paragraph E names Code of Hammurabi.", paragraphRef: "E" },
      { index: 27, passageIndex: 1, type: "short_answer", text: "What human mental ability was fundamentally altered by writing?", correctAnswer: "cognition", explanation: "Paragraph E specifies human cognition.", paragraphRef: "E" },

      // Passage 3: Q28 - Q40
      { index: 28, passageIndex: 2, type: "true_false_not_given", text: "Microplastics are synthetic polymer fragments larger than ten millimeters.", correctAnswer: "FALSE", explanation: "Paragraph A defines microplastics as under five millimeters.", paragraphRef: "A" },
      { index: 29, passageIndex: 2, type: "true_false_not_given", text: "Synthetic textile washing contributes to marine microplastics.", correctAnswer: "TRUE", explanation: "Paragraph A confirms synthetic textile washing as a source.", paragraphRef: "A" },
      { index: 30, passageIndex: 2, type: "true_false_not_given", text: "Persistent organic pollutants cannot bind to microplastic fibers.", correctAnswer: "FALSE", explanation: "Paragraph B states fibers are potent sorbents for hydrophobic pollutants.", paragraphRef: "B" },
      { index: 31, passageIndex: 2, type: "true_false_not_given", text: "Microplastics have been found in amphipods at depths exceeding 10,000 meters.", correctAnswer: "TRUE", explanation: "Paragraph D confirms 100% of specimens at 10,000m contained filaments.", paragraphRef: "D" },
      { index: 32, passageIndex: 2, type: "true_false_not_given", text: "All governments have agreed to ban microbeads by 2030.", correctAnswer: "NOT GIVEN", explanation: "Text mentions policy interventions as necessary, but does not state all governments agreed by 2030.", paragraphRef: "E" },

      { index: 33, passageIndex: 2, type: "sentence_completion", text: "Microplastics accumulate in ocean gyres and estuarine ______.", correctAnswer: "sediments", explanation: "Paragraph A states accumulation in estuarine sediments.", paragraphRef: "A" },
      { index: 34, passageIndex: 2, type: "sentence_completion", text: "Lipophilic toxins bioaccumulate in animal ______ tissues.", correctAnswer: "adipose", explanation: "Paragraph C specifies adipose tissues.", paragraphRef: "C" },
      { index: 35, passageIndex: 2, type: "sentence_completion", text: "Benthic surveys in the Mariana Trench confirmed abyssal ______ contamination.", correctAnswer: "benthic", explanation: "Paragraph D specifies abyssal benthic contamination.", paragraphRef: "D" },
      { index: 36, passageIndex: 2, type: "sentence_completion", text: "Washing machines should be fitted with mandatory ______ filters.", correctAnswer: "micro-fiber", explanation: "Paragraph E calls for mandatory micro-fiber filters.", paragraphRef: "E" },

      { index: 37, passageIndex: 2, type: "mcq", text: "What size threshold defines microplastics?", options: ["A. Under 1 millimeter", "B. Under 5 millimeters", "C. Under 10 millimeters", "D. Under 50 millimeters"], correctAnswer: "B", explanation: "Paragraph A specifies under 5 millimeters.", paragraphRef: "A" },
      { index: 38, passageIndex: 2, type: "mcq", text: "What bioaccumulates in adipose tissues of marine species?", options: ["A. Microbeads", "B. Lipophilic toxins", "C. Algae", "D. Salt crystals"], correctAnswer: "B", explanation: "Paragraph C names lipophilic toxins.", paragraphRef: "C" },
      { index: 39, passageIndex: 2, type: "mcq", text: "Where were amphipod specimens retrieved with 100% microplastic contamination?", options: ["A. Surface Atlantic", "B. Red Sea", "C. Mariana Trench", "D. Baltic Sea"], correctAnswer: "C", explanation: "Paragraph D specifies Mariana Trench.", paragraphRef: "C" },
      { index: 40, passageIndex: 2, type: "mcq", text: "Which autonomous vehicles are deployed to monitor ocean plastic density?", options: ["A. Submarines", "B. Autonomous underwater vehicles (AUVs)", "C. Drones", "D. Buoys"], correctAnswer: "B", explanation: "Paragraph F specifies autonomous underwater vehicles (AUVs).", paragraphRef: "F" },
    ],
  },
];
