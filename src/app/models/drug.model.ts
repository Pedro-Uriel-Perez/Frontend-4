// models/drug.model.ts
export interface DrugInfo {
    brandName: string;
    genericName: string;
    manufacturerName: string;
    indications: string[];
    warnings: string[];
    dosage: string[];
    adverseReactions: string[];
}

export interface AdverseEffect {
    reactionName: string;
    severity: string;
    date: string;
}