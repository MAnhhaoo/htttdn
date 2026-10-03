# Survey/CRM Database Documentation

## 1. Tables
The Survey/CRM feature introduces 5 new models to the Prisma schema:

1. **Survey**: The core entity representing a survey. It contains fields like `title`, `description`, `imageUrl`, `status`, `startDate`, and `endDate`.
2. **SurveyQuestion**: A question belonging to a specific survey. It defines the `type` (text, single_choice, multiple_choice, rating), a flag if it is `required`, and its `position` for deterministic ordering.
3. **SurveyOption**: Predefined options for choice-based questions (`single_choice`, `multiple_choice`).
4. **SurveyResponse**: Represents one submission of a survey by a specific customer. Contains `submittedAt` to track when it was submitted.
5. **SurveyAnswer**: Contains the actual value a customer provided for a given question. Supports multiple answer formats (`textAnswer`, `ratingValue`, `optionId`).

## 2. Relationships
The relational design is built to integrate natively with the existing `User` model, without creating separate models for admins, vendors, or customers.

- **Survey Ownership**: `Survey.createdById` maps to `User.id` (Restricted to admins and vendors by business logic).
- **Survey composition**:
  - `Survey` (1) ── (N) `SurveyQuestion`
  - `SurveyQuestion` (1) ── (N) `SurveyOption`
- **Submissions**:
  - `Survey` (1) ── (N) `SurveyResponse`
  - `User` (customer) (1) ── (N) `SurveyResponse`
- **Answers**:
  - `SurveyResponse` (1) ── (N) `SurveyAnswer`
  - `SurveyQuestion` (1) ── (N) `SurveyAnswer`
  - `SurveyOption` (1) ── (N) `SurveyAnswer` (optional link)

> **Important Constraints**: 
> - A unique constraint `@@unique([surveyId, userId])` on `SurveyResponse` ensures a customer can only submit a survey once.
> - There is intentionally NO unique constraint on `(responseId, questionId)` in `SurveyAnswer`. This allows multiple records to be inserted when a user answers a `multiple_choice` question (one record per selected option).

## 3. Generation Rules
The dataset generation strictly complies with all relational constraints and business logical rules:

1. **Deterministic Randomness**: Uses fixed-seed `Faker` to generate reproducible values.
2. **Foreign-Key Dependencies**: Survey generation happens strictly after `Order` and `User` generation so valid customers can be selected.
3. **Vendor Survey Eligibility**: During dataset generation, the system creates a mapping of `vendorId -> Set<customerId>`. A customer is added to a vendor's eligibility list **only** if they have an `Order` containing a product from that vendor with the status `completed` or `shipping`. Responses for vendor surveys are sampled exclusively from this set.
4. **Dates**: Generated surveys respect logical date rules (`startDate` <= `submittedAt` <= `endDate`). Draft surveys have no responses, while active/closed surveys do.

## 4. Workflows

### Admin Survey Flow
- **Purpose**: Admin creates platform-wide surveys (e.g., "Mức độ hài lòng của khách hàng", "Trải nghiệm mua sắm MIVA").
- **Target Audience**: Any active customer on the platform.
- **Process**: Admin defines survey title, optionally uploads a banner image (stored in `imageUrl`), and creates questions. Customers see this on their dashboard and submit responses. The admin can view aggregated platform stats.

### Vendor Survey Flow
- **Purpose**: Vendor creates shop-specific surveys to gather feedback on their products and service quality (e.g., "Chất lượng sản phẩm shop ABC").
- **Target Audience**: Strictly limited to customers who have actually purchased a product from this specific vendor's shop.
- **Process**: Vendor defines survey content. The backend validates whether a viewing customer has a completed/shipped order containing the vendor's products. Only eligible customers can view, fill, and submit this survey.

### Customer Response Flow
- **Viewing**: Customers view available active surveys.
- **Submitting**: They select options, provide ratings (1-5), and write text feedback.
- **Completion**: Upon successful submission, a single `SurveyResponse` is recorded alongside 1-to-N `SurveyAnswer` entries depending on the questions. The customer is barred from submitting the same survey twice.
