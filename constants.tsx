
import { ResourceLink, SignOfAdoption } from './types';

export const REPUTABLE_RESOURCES: ResourceLink[] = [
  {
    name: "The National Archives (USA)",
    url: "https://www.archives.gov/research/vital-records",
    category: "Archives",
    description: "Primary source for US census, immigration, and federal records."
  },
  {
    name: "Search Angels",
    url: "https://www.searchangels.org/",
    category: "Support",
    description: "Non-profit providing free genetic genealogy search assistance."
  },
  {
    name: "ClinVar - NCBI",
    url: "https://www.ncbi.nlm.nih.gov/clinvar/",
    category: "Medical",
    description: "A public archive of reports of the relationships among human variations and phenotypes."
  },
  {
    name: "SNPedia",
    url: "https://www.snpedia.com/",
    category: "Medical",
    description: "A wiki investigating human genetics, sharing information about the effects of variations in DNA."
  },
  {
    name: "Adoptee Rights Law Center",
    url: "https://adopteerightslaw.com/",
    category: "Legal",
    description: "In-depth info on original birth certificate laws across the US."
  },
  {
    name: "GEDmatch",
    url: "https://www.gedmatch.com/",
    category: "DNA",
    description: "Free tool to compare DNA files from different companies (Ancestry, 23andMe)."
  }
];

export const ADOPTION_SIGNS: SignOfAdoption[] = [
  {
    title: "Missing 'Long-Form' Birth Certificate",
    description: "Possessing only a 'short-form' or 'amended' certificate, which often lists adoptive parents as if they were biological.",
    type: "Documentation"
  },
  {
    title: "Medical History Discrepancies",
    description: "Lack of specific family medical history or having conditions that don't match either parent's known lineage.",
    type: "Medical"
  },
  {
    title: "Lack of Infant/Pregnancy Photos",
    description: "A suspicious absence of photos showing the mother during pregnancy or the child immediately after birth.",
    type: "Social"
  },
  {
    title: "Genetic Trait Anomalies",
    description: "Physical traits (blood type, eye color inheritance) that are biologically impossible for the documented parents.",
    type: "Physical"
  },
  {
    title: "Family 'Secrets' or Whispers",
    description: "Inconsistent stories about birth details or elders who lower their voices when discussing the child's arrival.",
    type: "Social"
  }
];
