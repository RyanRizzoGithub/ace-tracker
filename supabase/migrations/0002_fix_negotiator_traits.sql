-- ACE Tracker — fix Negotiator trait classification
-- The taxonomy originally had Aligning and Steering swapped. Per the ACE Report
-- and the Confidence Traits report, Aligning is a Negotiator authentic-
-- confidence (AC) trait and Steering is a Negotiator over-confidence (OC)
-- trait. Scores themselves were matched by trait name, so only the
-- classification on existing rows needs correcting.

update public.report_scores
set confidence_type = 'AC'
where trait = 'Aligning' and confidence_type <> 'AC';

update public.report_scores
set confidence_type = 'OC'
where trait = 'Steering' and confidence_type <> 'OC';
