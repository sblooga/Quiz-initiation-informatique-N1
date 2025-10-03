export type QuestionBase = {
  id: string;
  type: 'QCM' | 'Vrai/Faux' | 'Compléter' | 'Associer';
  question: string;
  theme: string;
  referenceCours: string;
  motClePDF?: string;
  pagePDF?: number;
};

export interface QCMQuestion extends QuestionBase {
  choices: string[];
  answer: string | string[];
}

export interface VFQuestion extends QuestionBase {
  answer: 'Vrai' | 'Faux';
}

export interface CompleterQuestion extends QuestionBase {
  answer: string | string[];
}

export interface AssocierQuestion extends QuestionBase {
  pairs: Array<{ gauche: string; droite: string }>;
}

export type Question = QCMQuestion | VFQuestion | CompleterQuestion | AssocierQuestion;
