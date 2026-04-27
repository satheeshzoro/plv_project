export const ARTICLE_TYPES = [
  "Research Paper",
  "Review Article",
  "Case Study",
  "Technical Report",
  "Short Communication",
];

import journalClinicalSciencesResearch from "../../assets/journals/journal_clinical_sciences_research.jpg";
import journalPharmaceuticalSciencesDrugTechnology from "../../assets/journals/journal_pharmaceutical_sciences_drug_technology.jpg";
import journalBiochemistryPhysiology from "../../assets/journals/journal_biochemistry_physiology.jpg";
import journalPaediatricsChildhoodObesity from "../../assets/journals/journal_paediatrics_childhood_obesity.jpg";
import journalHealthCareResearchCaseReports from "../../assets/journals/journal_health_care_research_case_reports.jpg";
import journalMolecularBiologyInfectiousDiseases from "../../assets/journals/journal_molecular_biology_infectious_diseases.jpg";
import journalFoodNutritionalSciences from "../../assets/journals/journal_food_nutritional_sciences.jpg";
import journalGeneticsBiotechnology from "../../assets/journals/journal_genetics_biotechnology.jpg";
import journalNeurologicalPsychological from "../../assets/journals/journal_neurological_psychological.jpg";
import journalGynaecologyObstetrics from "../../assets/journals/journal_gynaecology_obstetrics.jpg";

export const JOURNAL_OPTIONS = [
  {
    id: "clinical-sciences",
    title: "Journal of Clinical Sciences Research",
    category: "Medical Sciences",
    image: journalClinicalSciencesResearch,
    about:
      "The Journal of Clinical Sciences Research publishes peer-reviewed clinical investigations, translational studies, diagnostics, therapeutic advances, and practice-oriented medical scholarship across internal medicine and allied specialties.",
  },
  {
    id: "pharmaceutical-sciences",
    title: "Journal of Pharmaceutical Sciences Drug Technology",
    category: "Biotechnology",
    image: journalPharmaceuticalSciencesDrugTechnology,
    about:
      "This journal type covers pharmaceutics, drug delivery systems, formulation science, quality control, molecular therapeutics, and pharmaceutical innovation for academic and industrial researchers.",
  },
  {
    id: "biochemistry-physiology",
    title: "Biochemistry & Physiology Journal",
    category: "Biotechnology",
    image: journalBiochemistryPhysiology,
    about:
      "Biochemistry and physiology articles in this journal focus on molecular pathways, cellular function, applied biological systems, biomarkers, metabolism, and translational experimental biology.",
  },
  {
    id: "paediatrics-obesity",
    title: "Paediatrics & Childhood Obesity",
    category: "Medical Sciences",
    image: journalPaediatricsChildhoodObesity,
    about:
      "This journal publishes paediatric care research, childhood nutrition, obesity interventions, preventive healthcare, developmental health studies, and family-centered clinical evidence.",
  },
  {
    id: "health-care-case-reports",
    title: "Health Care Research & Case Reports Journal",
    category: "Medical Sciences",
    image: journalHealthCareResearchCaseReports,
    about:
      "A multidisciplinary healthcare journal featuring applied health systems research, case reports, diagnostics, patient-centered innovation, and practice-improvement studies.",
  },
  {
    id: "molecular-biology-infectious-diseases",
    title: "Journal of Molecular Biology & Infectious Diseases",
    category: "Biotechnology",
    image: journalMolecularBiologyInfectiousDiseases,
    about:
      "This journal type includes infectious disease biology, host-pathogen interaction, virology, molecular diagnostics, laboratory medicine, and emerging biomedical discovery.",
  },
  {
    id: "food-nutritional-sciences",
    title: "Food & Nutritional Sciences Journal",
    category: "Environmental Science",
    image: journalFoodNutritionalSciences,
    about:
      "Food and nutritional sciences research in this journal spans dietetics, public health nutrition, functional foods, metabolism, nutritional policy, and evidence-based dietary interventions.",
  },
  {
    id: "genetics-biotechnology",
    title: "Genetics & Biotechnology Journal",
    category: "Biotechnology",
    image: journalGeneticsBiotechnology,
    about:
      "This journal type covers genetics, genomics, genetic engineering, laboratory biotechnology, applied molecular research, bioinnovation, and modern therapeutic science.",
  },
  {
    id: "neurological-psychological",
    title: "Neurological & Psychological Journal",
    category: "Medical Sciences",
    image: journalNeurologicalPsychological,
    about:
      "The journal features neurology, mental health, cognition, neuropsychology, behavioral medicine, brain science, and integrated clinical neuroscience research.",
  },
  {
    id: "gynaecology-obstetrics",
    title: "Journal of Gynaecology & Obstetrics",
    category: "Medical Sciences",
    image: journalGynaecologyObstetrics,
    about:
      "This journal type contains obstetrics, maternal health, reproductive medicine, gynecological practice, women's health policy, and clinical care research across the continuum of care.",
  },
];

export const JOURNAL_CATEGORY_BY_TITLE = Object.fromEntries(
  JOURNAL_OPTIONS.map((journal) => [journal.title, journal.category]),
);
