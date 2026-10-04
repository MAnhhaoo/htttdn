-- Existing data was checked before adding these constraints.
-- They prevent duplicate question/option positions and duplicate sizes per color.
CREATE UNIQUE INDEX "SurveyQuestion_surveyId_position_key"
ON "SurveyQuestion"("surveyId", "position");

CREATE UNIQUE INDEX "SurveyOption_questionId_position_key"
ON "SurveyOption"("questionId", "position");

CREATE UNIQUE INDEX "ProductVariant_productColorId_size_key"
ON "ProductVariant"("productColorId", "size");
