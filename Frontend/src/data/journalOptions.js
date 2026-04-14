export const ARTICLE_TYPES = [
  "Research Paper",
  "Review Article",
  "Case Study",
  "Technical Report",
  "Short Communication",
];

export const JOURNAL_OPTIONS = [
  {
    id: "clinical-sciences",
    title: "Journal of Clinical Sciences Research",
    category: "Medical Sciences",
    image:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=900&h=600&fit=crop",
    about:
      "The Journal of Clinical Sciences Research publishes peer-reviewed clinical investigations, translational studies, diagnostics, therapeutic advances, and practice-oriented medical scholarship across internal medicine and allied specialties.",
  },
  {
    id: "pharmaceutical-sciences",
    title: "Journal of Pharmaceutical Sciences Drug Technology",
    category: "Biotechnology",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&h=600&fit=crop",
    about:
      "This journal type covers pharmaceutics, drug delivery systems, formulation science, quality control, molecular therapeutics, and pharmaceutical innovation for academic and industrial researchers.",
  },
  {
    id: "biochemistry-physiology",
    title: "Biochemistry & Physiology Journal",
    category: "Biotechnology",
    image:
      "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=900&h=600&fit=crop",
    about:
      "Biochemistry and physiology articles in this journal focus on molecular pathways, cellular function, applied biological systems, biomarkers, metabolism, and translational experimental biology.",
  },
  {
    id: "paediatrics-obesity",
    title: "Paediatrics & Childhood Obesity",
    category: "Medical Sciences",
    image:
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=900&h=600&fit=crop",
    about:
      "This journal publishes paediatric care research, childhood nutrition, obesity interventions, preventive healthcare, developmental health studies, and family-centered clinical evidence.",
  },
  {
    id: "health-care-case-reports",
    title: "Health Care Research & Case Reports Journal",
    category: "Medical Sciences",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&h=600&fit=crop",
    about:
      "A multidisciplinary healthcare journal featuring applied health systems research, case reports, diagnostics, patient-centered innovation, and practice-improvement studies.",
  },
  {
    id: "molecular-biology-infectious-diseases",
    title: "Journal of Molecular Biology & Infectious Diseases",
    category: "Biotechnology",
    image:
      "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=900&h=600&fit=crop",
    about:
      "This journal type includes infectious disease biology, host-pathogen interaction, virology, molecular diagnostics, laboratory medicine, and emerging biomedical discovery.",
  },
  {
    id: "food-nutritional-sciences",
    title: "Food & Nutritional Sciences Journal",
    category: "Environmental Science",
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900&h=600&fit=crop",
    about:
      "Food and nutritional sciences research in this journal spans dietetics, public health nutrition, functional foods, metabolism, nutritional policy, and evidence-based dietary interventions.",
  },
  {
    id: "genetics-biotechnology",
    title: "Genetics & Biotechnology Journal",
    category: "Biotechnology",
    image:
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=900&h=600&fit=crop",
    about:
      "This journal type covers genetics, genomics, genetic engineering, laboratory biotechnology, applied molecular research, bioinnovation, and modern therapeutic science.",
  },
  {
    id: "neurological-psychological",
    title: "Neurological & Psychological Journal",
    category: "Medical Sciences",
    image:
      "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=900&h=600&fit=crop",
    about:
      "The journal features neurology, mental health, cognition, neuropsychology, behavioral medicine, brain science, and integrated clinical neuroscience research.",
  },
  {
    id: "gynaecology-obstetrics",
    title: "Journal of Gynaecology & Obstetrics",
    category: "Medical Sciences",
    image:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=900&h=600&fit=crop",
    about:
      "This journal type contains obstetrics, maternal health, reproductive medicine, gynecological practice, women's health policy, and clinical care research across the continuum of care.",
  },
];

export const JOURNAL_CATEGORY_BY_TITLE = Object.fromEntries(
  JOURNAL_OPTIONS.map((journal) => [journal.title, journal.category]),
);
